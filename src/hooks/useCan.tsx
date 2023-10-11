import { useAuthContext } from '../context/auth-context'

interface UseCanProps {
  permissions?: string[]
  roles?: string[]
}

export function useCan({ permissions, roles }: UseCanProps) {
  const { user, isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return false
  }

  if (permissions?.length) {
    const hasAllPermissions = permissions.every((item) => {
      return user.permissions.includes(item)
    })

    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length) {
    const hasAllRoles = roles.some((item) => {
      return user.roles.includes(item)
    })

    if (!hasAllRoles) {
      return false
    }
  }

  return true
}
