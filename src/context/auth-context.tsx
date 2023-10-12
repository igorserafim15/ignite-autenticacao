import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { api } from '../service/api'
import { useRouter } from 'next/navigation'
import { destroyCookie, parseCookies, setCookie } from 'nookies'

type SignInCredentials = {
  email: string
  password: string
}

interface IUser {
  email: string
  permissions: string[]
  roles: string[]
}

type AuthContextProps = {
  signIn(credentials: SignInCredentials): Promise<void>
  signOut(): void
  isAuthenticated: boolean
  user: IUser | null
}

const AuthContext = createContext({} as AuthContextProps)

let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  authChannel.postMessage('signOut')
  window.location.href = 'http://localhost:3000/'
}

type AuthProviderProps = { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()

  const [user, setUser] = useState<IUser | null>(null)
  const isAuthenticated = !!user

  function handleAuthenticate() {
    const { 'nextauth.token': token } = parseCookies()
    if (!token) return

    api.get('/me').then((response) => {
      const { permissions, roles, email } = response.data
      setUser({ email, permissions, roles })
    })
  }

  const handleAuthChannel = useCallback(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      if (message.data === 'signOut') {
        signOut()
      }
      // if (message.data === 'signIn') {
      //   router.push('/dashboard')
      // }
    }
  }, [])

  useEffect(() => {
    handleAuthenticate()
    handleAuthChannel()
  }, [handleAuthChannel])

  async function signIn(credentials: SignInCredentials) {
    try {
      const response = await api.post('sessions', credentials)
      const { permissions, roles, token, refreshToken } = response.data

      setCookie(undefined, 'nextauth.token', token)
      setCookie(undefined, 'nextauth.refreshToken', refreshToken)
      setUser({ email: credentials.email, permissions, roles })

      api.defaults.headers.Authorization = `Bearer ${token}`

      router.push('/dashboard')
    } catch (err) {
      console.error('Algo deu errado', err)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
