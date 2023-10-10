import { useEffect } from 'react'
import { useAuthContext } from '../context/auth-context'
import { api } from '../service/api'

export default function Dashboard() {
  const { user } = useAuthContext()

  useEffect(() => {
    api.get('/me').then(console.log)
  }, [])

  return <h1>Dashboard: {user?.email}</h1>
}
