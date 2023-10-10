import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { api } from '../service/api'
import { useRouter } from 'next/router'
import { parseCookies, setCookie } from 'nookies'

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
  isAuthenticated: boolean
  user: IUser | null
}

const AuthContext = createContext({} as AuthContextProps)

type AuthProviderProps = { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()

  const [user, setUser] = useState<IUser | null>(null)
  const isAuthenticated = !!user

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get('/me').then((response) => {
        const { permissions, roles, email } = response.data
        setUser({ email, permissions, roles })
      })
    }
  }, [])

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
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
