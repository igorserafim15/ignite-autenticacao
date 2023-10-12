import { useEffect } from 'react'
import { useAuthContext } from '../context/auth-context'
import { api, setupAPIClient } from '../service/api'
import { withSSRAuth } from '../utils/withSSRAuth'
import { CanProvider } from '../components/Can'

export default function Dashboard() {
  const { user, signOut } = useAuthContext()

  useEffect(() => {
    api.get('/me').then(console.log)
  }, [])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={signOut}>Sair</button>
      <CanProvider permissions={['metrics.list']} roles={[]}>
        Metricas aqui...
      </CanProvider>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  apiClient.get('/me').then(console.log)

  return {
    props: {},
  }
})
