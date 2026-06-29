import { useUser } from '@clerk/clerk-react'

export function useRole() {
  const { user, isLoaded, isSignedIn } = useUser()
  const role = user?.publicMetadata?.role || 'user'

  return {
    role,
    isLoaded,
    isSignedIn: !!isSignedIn,
    isSuperAdmin:    role === 'superadmin',
    isAdmin:         ['admin', 'superadmin'].includes(role),
    isModerator:     ['moderator', 'admin', 'superadmin'].includes(role),
    canManageContent: ['moderator', 'admin', 'superadmin'].includes(role),
    canManageUsers:  ['admin', 'superadmin'].includes(role),
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
