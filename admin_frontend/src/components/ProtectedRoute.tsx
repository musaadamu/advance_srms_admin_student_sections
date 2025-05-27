import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { canAccessRoute, hasPermission } from '@/config/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    resource: string
    action: string
  }
  allowedRoles?: string[]
  fallbackPath?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
  fallbackPath = '/unauthorized'
}) => {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check route access permission
  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check specific permission if required
  if (requiredPermission) {
    const { resource, action } = requiredPermission
    if (!hasPermission(user.role, resource, action)) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

// Higher-order component for permission-based rendering
export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: { resource: string; action: string }
) => {
  return (props: any) => {
    const { user } = useAuthStore()
    
    if (!user || !hasPermission(user.role, requiredPermission.resource, requiredPermission.action)) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access this feature.
            </p>
          </div>
        </div>
      )
    }
    
    return <WrappedComponent {...props} />
  }
}

// Component for conditional rendering based on permissions
export const PermissionGate: React.FC<{
  children: React.ReactNode
  resource: string
  action: string
  fallback?: React.ReactNode
}> = ({ children, resource, action, fallback = null }) => {
  const { user } = useAuthStore()
  
  if (!user || !hasPermission(user.role, resource, action)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Component for role-based rendering
export const RoleGate: React.FC<{
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}> = ({ children, allowedRoles, fallback = null }) => {
  const { user } = useAuthStore()
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
