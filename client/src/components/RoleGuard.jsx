import { Navigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { Shield } from 'lucide-react'

export default function RoleGuard({ children, required = 'moderator' }) {
  const { isLoaded, isSignedIn, isModerator, isAdmin, isSuperAdmin } = useRole()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <Shield size={32} className="text-g-orange animate-pulse" />
          <p className="text-g-muted font-barlow uppercase tracking-widest text-sm">Verifying Access…</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) return <Navigate to="/" replace />

  const hasAccess =
    required === 'superadmin' ? isSuperAdmin :
    required === 'admin'      ? isAdmin :
    required === 'moderator'  ? isModerator :
    true

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center px-4">
        <Shield size={48} className="text-g-red opacity-60" />
        <h2 className="font-barlow font-700 text-2xl text-g-text uppercase tracking-wide">Access Denied</h2>
        <p className="text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
          You don't have the clearance to view this section.
        </p>
        <Navigate to="/" replace />
      </div>
    )
  }

  return children
}
