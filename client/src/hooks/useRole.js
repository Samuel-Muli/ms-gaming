import { useUser } from '@clerk/clerk-react'

// Mirrors the ROLES config in server.js — the client and server can't
// share a module across this repo's boundary, so if you ever change the
// role hierarchy, update both places.
const MOD_PLUS   = ['moderator', 'admin', 'superadmin']
const ADMIN_PLUS = ['admin', 'superadmin']

export function useRole() {
  const { user, isLoaded, isSignedIn } = useUser()
  const role = user?.publicMetadata?.role || 'user'

  return {
    role,
    isLoaded,
    isSignedIn: !!isSignedIn,
    isSuperAdmin:    role === 'superadmin',
    isAdmin:         ADMIN_PLUS.includes(role),
    isModerator:     MOD_PLUS.includes(role),
    canManageContent: MOD_PLUS.includes(role),
    canManageUsers:  ADMIN_PLUS.includes(role),
    canGrantAdmin:   role === 'superadmin',
  }
}

export function getRoleBadgeClass(role) {
  const map = {
    superadmin: 'badge-superadmin',
    admin:      'badge-admin',
    moderator:  'badge-moderator',
    user:       'badge-user',
  }
  return map[role] || 'badge-user'
}

export function getRoleLabel(role) {
  const map = {
    superadmin: '⚔️ Super Admin',
    admin:      '🛡️ Admin',
    moderator:  '🔰 Moderator',
    user:       '👤 Member',
  }
  return map[role] || '👤 Member'
}
