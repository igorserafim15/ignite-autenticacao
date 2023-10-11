import { useEffect } from 'react'
import { useAuthContext } from '../context/auth-context'
import { api, setupAPIClient } from '../service/api'
import { withSSRAuth } from '../utils/withSSRAuth'
import { useCan } from '../hooks/useCan'

export default function Dashboard() {
  const { user } = useAuthContext()

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
  })

  useEffect(() => {
    api.get('/me').then(console.log)
  }, [])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      {userCanSeeMetrics && <div>Metricas aqui...</div>}
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
