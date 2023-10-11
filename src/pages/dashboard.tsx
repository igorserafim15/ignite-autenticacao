import { useEffect } from 'react'
import { useAuthContext } from '../context/auth-context'
import { api } from '../service/api'
import { withSSRAuth } from '../utils/withSSRAuth'

export default function Dashboard() {
  const { user } = useAuthContext()

  useEffect(() => {
    api.get('/me').then(console.log)
  }, [])

  return <h1>Dashboard: {user?.email}</h1>
}

export const getServerSideProps = withSSRAuth(async () => ({
  props: {},
}))
