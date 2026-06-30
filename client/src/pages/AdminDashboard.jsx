import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Shield, Users, FileText, MessageSquare, ChevronDown, Trash2, Pin, RefreshCw, Crown, AlertTriangle } from 'lucide-react'
import RoleGuard from '../components/RoleGuard'
import { useRole, getRoleBadgeClass, getRoleLabel } from '../hooks/useRole'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card flex items-center gap-4" style={{ borderLeftColor: color }}>
      <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="font-orbitron font-700 text-2xl" style={{ color }}>{value ?? '—'}</div>
        <div className="text-g-muted uppercase" style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.12em' }}>{label}</div>
      </div>
    </div>
  )
}

// ── Role picker ────────────────────────────────────────────────────────────────
const ALL_ROLES = ['user', 'moderator', 'admin', 'superadmin']

function RolePicker({ user, currentUserRole, onChanged }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')
  const { getToken }          = useAuth()

  const targetRole = user.role || 'user'

  // Which roles can the current user assign to this target?
  const assignable = ALL_ROLES.filter(r => {
    if (currentUserRole === 'superadmin') {
      // Can't self-demote off superadmin via the picker
      if (user.isSelf && r !== 'superadmin') return false
      return true
    }
    if (currentUserRole === 'admin') {
      // Admins can only toggle moderator/user on non-admin accounts
      if (['admin', 'superadmin'].includes(targetRole)) return false
      return ['user', 'moderator'].includes(r)
    }
    return false
  })

  const setRole = async (role) => {
    setOpen(false)
    setLoading(true)
    setMsg('')
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg('✓')
      onChanged(user.id, role)
    } catch (e) {
      setMsg(`✗ ${e.message}`)
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const isLocked =
    (targetRole === 'superadmin' && currentUserRole !== 'superadmin') ||
    (['admin', 'superadmin'].includes(targetRole) && currentUserRole === 'admin') ||
    assignable.length === 0

  return (
    <div className="relative inline-block">
      <button
        onClick={() => !isLocked && setOpen(o => !o)}
        disabled={loading || isLocked}
        className={`flex items-center gap-1.5 px-2.5 py-1 border transition-all ${getRoleBadgeClass(targetRole)} badge`}
        style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.7 : 1 }}
      >
        {loading ? <RefreshCw size={10} className="animate-spin" /> : null}
        {getRoleLabel(targetRole)}
        {!isLocked && <ChevronDown size={10} />}
      </button>
      {msg && (
        <span className="ml-2 text-xs" style={{ color: msg.startsWith('✓') ? 'var(--green)' : 'var(--red)', fontFamily: 'JetBrains Mono' }}>
          {msg}
        </span>
      )}

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-max"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '2px solid var(--orange)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        >
          {assignable.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="block w-full px-4 py-2 text-left hover:bg-g-surface2 transition-colors"
              style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', color: r === targetRole ? 'var(--orange)' : 'var(--muted)' }}
            >
              {getRoleLabel(r)} {r === targetRole && '✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Recent post row ────────────────────────────────────────────────────────────
function RecentPostRow({ post, onDelete, onPin }) {
  const timeAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <tr className="border-b border-g-border hover:bg-g-surface2 transition-colors">
      <td className="py-3 px-4">
        <div className="font-barlow text-g-text font-600 text-sm truncate max-w-xs" title={post.title}>{post.title}</div>
        <div className="text-g-muted text-xs mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{post.authorName}</div>
      </td>
      <td className="py-3 px-4">
        <span className={`badge ${post.isDeleted ? 'badge-moderator' : 'badge-general'}`} style={{ fontSize: '10px' }}>
          {post.isDeleted ? 'DELETED' : post.category}
        </span>
      </td>
      <td className="py-3 px-4 text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
        {timeAgo(post.createdAt)}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onPin(post._id, post.isPinned)} className="text-g-muted hover:text-g-green transition-colors" title="Toggle pin">
            <Pin size={13} style={{ fill: post.isPinned ? 'var(--green)' : 'none', color: post.isPinned ? 'var(--green)' : undefined }} />
          </button>
          <button onClick={() => onDelete(post._id)} className="text-g-muted hover:text-g-red transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
function Dashboard() {
  const { getToken }               = useAuth()
  const { role, isSuperAdmin, isAdmin, isModerator } = useRole()

  const [stats, setStats]          = useState(null)
  const [users, setUsers]          = useState([])
  const [posts, setPosts]          = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [tab, setTab]              = useState('overview')

  const authFetch = async (url, opts = {}) => {
    const token = await getToken()
    return fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers } })
  }

  // Load stats
  useEffect(() => {
    authFetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  // Load users (admin+)
  const loadUsers = async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    try {
      const res = await authFetch('/api/admin/users?limit=50')
      const data = await res.json()
      setUsers(data.users || [])
    } catch {}
    finally { setLoadingUsers(false) }
  }

  // Load recent posts (mod+)
  const loadPosts = async () => {
    try {
      const res = await authFetch('/api/admin/recent-posts')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => {
    if (tab === 'users')   loadUsers()
    if (tab === 'content') loadPosts()
  }, [tab])

  const handleRoleChanged = (userId, newRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    await authFetch(`/api/posts/${postId}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p._id !== postId))
  }

  const handlePinPost = async (postId, currentPin) => {
    await authFetch(`/api/posts/${postId}/pin`, { method: 'POST' })
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, isPinned: !p.isPinned } : p))
  }

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const TABS = [
    { id: 'overview', label: 'Overview',    icon: Shield },
    ...(isAdmin   ? [{ id: 'users',   label: 'Users',   icon: Users    }] : []),
    ...(isModerator ? [{ id: 'content', label: 'Content', icon: FileText }] : []),
  ]

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-g-border">
        <div
          className="w-12 h-12 flex items-center justify-center"
          style={{ background: 'rgba(240,132,44,0.1)', border: '1px solid rgba(240,132,44,0.3)' }}
        >
          <Shield size={24} className="text-g-orange" />
        </div>
        <div>
          <h1 className="font-barlow font-800 text-3xl text-g-text uppercase tracking-wide">Admin Panel</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`badge ${getRoleBadgeClass(role)}`}>{getRoleLabel(role)}</span>
            {isSuperAdmin && (
              <span className="text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.08em' }}>
                Full access — you are the Super Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-g-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-3 transition-all"
            style={{
              fontFamily: 'Barlow Condensed',
              fontSize: '14px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color:        tab === id ? 'var(--orange)' : 'var(--muted)',
              background:   'none',
              border:       'none',
              borderBottom: tab === id ? '2px solid var(--orange)' : '2px solid transparent',
              cursor:       'pointer',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Users}        label="Total Users"    value={stats?.users}    color="var(--orange)" />
            <StatCard icon={FileText}     label="Community Posts" value={stats?.posts}   color="var(--gold)" />
            <StatCard icon={MessageSquare} label="Comments"      value={stats?.comments} color="var(--green)" />
          </div>

          {/* Role guide */}
          <div className="gaming-card p-6">
            <div className="section-label mb-4">Role Hierarchy</div>
            <div className="space-y-3">
              {[
                { role: 'superadmin', label: '⚔️ Super Admin', desc: 'Full control — can assign any role including Admin. Cannot be demoted by anyone except another Super Admin.', you: isSuperAdmin },
                { role: 'admin',      label: '🛡️ Admin',       desc: 'Can manage users, assign Moderator roles, view all content, and access the admin panel.', you: role === 'admin' },
                { role: 'moderator',  label: '🔰 Moderator',   desc: 'Can pin/delete community posts and comments. Cannot manage users or roles.', you: role === 'moderator' },
                { role: 'user',       label: '👤 Member',       desc: 'Standard registered user. Can post, comment, and like content.', you: role === 'user' },
              ].map(r => (
                <div key={r.role} className="flex items-start gap-3 p-3 border border-g-border" style={{ background: r.you ? 'rgba(240,132,44,0.04)' : 'transparent' }}>
                  <span className={`badge ${getRoleBadgeClass(r.role)} shrink-0 mt-0.5`}>{r.label}</span>
                  <div>
                    <p className="text-g-muted text-sm" style={{ fontFamily: 'Rajdhani' }}>{r.desc}</p>
                    {r.you && <span className="text-g-orange text-xs font-barlow uppercase tracking-wide">← your current role</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isSuperAdmin && (
            <div
              className="flex items-start gap-3 p-4 border"
              style={{ background: 'rgba(232,58,58,0.05)', borderColor: 'rgba(232,58,58,0.2)' }}
            >
              <AlertTriangle size={18} className="text-g-red shrink-0 mt-0.5" />
              <div>
                <p className="font-barlow font-600 text-g-red uppercase tracking-wide text-sm mb-1">Super Admin Note</p>
                <p className="text-g-muted text-sm" style={{ fontFamily: 'Rajdhani' }}>
                  Your Super Admin role is protected. No other user can demote you. To grant Admin access to a trusted
                  helper, go to the Users tab and set their role to "Admin". They will then be able to assign Moderators
                  but cannot override you or grant Admin to others.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && isAdmin && (
        <div>
          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              className="input max-w-sm"
              placeholder="Search by name or email…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>

          {loadingUsers ? (
            <div className="text-center py-10 text-g-muted">
              <RefreshCw size={28} className="mx-auto mb-3 animate-spin" />
              Loading users…
            </div>
          ) : (
            <div className="gaming-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-g-border" style={{ background: 'var(--s2)' }}>
                      {['Player', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-left font-barlow text-g-muted uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-g-border hover:bg-g-surface2 transition-colors">
                        {/* Player */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {u.imageUrl
                              ? <img src={u.imageUrl} alt="" className="w-7 h-7 rounded-sm object-cover" style={{ border: '1px solid var(--border)' }} />
                              : <div className="w-7 h-7 flex items-center justify-center font-orbitron text-xs" style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--gold)' }}>{(u.firstName || u.username || '?').charAt(0)}</div>
                            }
                            <div>
                              <div className="text-g-text font-barlow font-600 text-sm">{u.firstName} {u.lastName}</div>
                              {u.username && <div className="text-g-muted text-xs">@{u.username}</div>}
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="py-3 px-4 text-g-muted text-sm" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
                          {u.email}
                        </td>
                        {/* Role */}
                        <td className="py-3 px-4">
                          <RolePicker
                            user={u}
                            currentUserRole={role}
                            onChanged={handleRoleChanged}
                          />
                        </td>
                        {/* Joined */}
                        <td className="py-3 px-4 text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        {/* Actions */}
                        <td className="py-3 px-4">
                          {u.role === 'superadmin' && (
                            <span className="flex items-center gap-1 text-g-orange" style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.06em' }}>
                              <Crown size={11} /> PROTECTED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
                    {userSearch ? 'No users match your search.' : 'No users found.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {tab === 'content' && isModerator && (
        <div>
          <div className="section-label mb-4">Recent Community Posts</div>
          {posts.length === 0 ? (
            <div className="text-center py-10 text-g-muted gaming-card" style={{ fontFamily: 'Rajdhani' }}>
              No posts to display.
            </div>
          ) : (
            <div className="gaming-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-g-border" style={{ background: 'var(--s2)' }}>
                      {['Title / Author', 'Category', 'Posted', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-left font-barlow text-g-muted uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(p => (
                      <RecentPostRow
                        key={p._id}
                        post={p}
                        onDelete={handleDeletePost}
                        onPin={handlePinPost}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Wrap with role guard — only moderators and above
export default function AdminDashboard() {
  return (
    <RoleGuard required="moderator">
      <Dashboard />
    </RoleGuard>
  )
}
