import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // No role specified - allow any authenticated user
  if (!role) {
    return children
  }

  // Role mismatch - redirect to appropriate dashboard
  if (user?.role !== role) {
    // If admin tries to access client route, send to admin
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    // If client tries to access admin route, send to client
    if (user?.role === 'client') {
      return <Navigate to="/client" replace />
    }
  }

  // Role matches - allow access
  return children
}

export default ProtectedRoute