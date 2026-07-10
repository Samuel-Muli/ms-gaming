import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { X, Shield, ArrowUp, ArrowDown, Crown } from 'lucide-react'

const ROLE_ORDER = { user: 0, moderator: 1, admin: 2, superadmin: 3 }
const ROLE_LABELS = {
  user:       { icon: '👤', label: 'Member',      color: '#8888AA' },
  moderator:  { icon: '🔰', label: 'Moderator',   color: '#C8A044' },
  admin:      { icon: '🛡️', label: 'Admin',        color: '#F0842C' },
  superadmin: { icon: '⚔️', label: 'Super Admin', color: '#E83A3A' },
}
const STORED_KEY  = 'msg-last-role'
const NOTED_KEY   = 'msg-last-role-ts'

export default function RoleChangePopup() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [info, setInfo]     = useState(null)   // { prev, next, note, isPromotion }
  const [closing, setClose] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return

    const currentRole  = user.publicMetadata?.role || 'user'
    const changedAt    = user.publicMetadata?.roleChangedAt || ''
    const note         = user.publicMetadata?.roleNote || ''
    const lastRole     = localStorage.getItem(STORED_KEY)
    const lastSeenTs   = localStorage.getItem(NOTED_KEY)

    // First time — just store, don't show popup
    if (!lastRole) {
      localStorage.setItem(STORED_KEY, currentRole)
      if (changedAt) localStorage.setItem(NOTED_KEY, changedAt)
      return
    }

    // Detect: role changed AND we haven't shown popup for this change yet
    const roleChanged = lastRole !== currentRole
    const newChange   = changedAt && changedAt !== lastSeenTs

    if (roleChanged || newChange) {
      setInfo({
        prev:        lastRole,
        next:        currentRole,
        note,
        isPromotion: (ROLE_ORDER[currentRole] || 0) >= (ROLE_ORDER[lastRole] || 0),
      })
      // Update stored state immediately so popup doesn't re-trigger
      localStorage.setItem(STORED_KEY, currentRole)
      if (changedAt) localStorage.setItem(NOTED_KEY, changedAt)
    }
  }, [isLoaded, isSignedIn, user])

  const dismiss = () => {
    setClose(true)
    setTimeout(() => setInfo(null), 320)
  }

  if (!info) return null

  const prevMeta = ROLE_LABELS[info.prev] || ROLE_LABELS.user
  const nextMeta = ROLE_LABELS[info.next] || ROLE_LABELS.user

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} style={{
        position: 'fixed', inset: 0, zIndex: 810,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        animation: closing ? 'fadeOut 0.32s ease forwards' : 'fadeIn 0.25s ease',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 811,
        width: 'min(94vw, 440px)',
        background: 'var(--surface)',
        border: `2px solid ${info.isPromotion ? 'var(--orange)' : 'var(--red)'}`,
        borderRadius: 4,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${info.isPromotion ? 'rgba(240,132,44,0.15)' : 'rgba(232,58,58,0.15)'}`,
        animation: closing
          ? 'popupOut 0.32s ease forwards'
          : 'popupIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        overflow: 'hidden',
      }}>
        {/* Coloured top bar */}
        <div style={{
          height: 4,
          background: info.isPromotion
            ? 'linear-gradient(90deg, var(--orange), var(--gold))'
            : 'linear-gradient(90deg, var(--red), #9B2020)',
        }} />

        {/* Close */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--s2)', border: '1px solid var(--border)',
          color: 'var(--muted)', width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><X size={13} /></button>

        <div style={{ padding: '20px 22px 22px' }}>
          {/* Heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: info.isPromotion ? 'rgba(240,132,44,0.12)' : 'rgba(232,58,58,0.12)',
              border: `1px solid ${info.isPromotion ? 'rgba(240,132,44,0.3)' : 'rgba(232,58,58,0.3)'}`,
            }}>
              {info.isPromotion
                ? <ArrowUp size={20} style={{ color: 'var(--orange)' }} />
                : <ArrowDown size={20} style={{ color: 'var(--red)' }} />}
            </div>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>
                Role {info.isPromotion ? 'Updated' : 'Changed'}
              </div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                M S GAMING · Role Notification
              </div>
            </div>
          </div>

          {/* Role change arrow */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            padding: '16px', marginBottom: 16,
            background: 'var(--s2)', border: '1px solid var(--border)',
          }}>
            {/* Previous role */}
            <div style={{ textAlign: 'center', opacity: 0.7 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{prevMeta.icon}</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', fontWeight: 700, color: prevMeta.color }}>
                {prevMeta.label}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>Before</div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontSize: 24 }}>{info.isPromotion ? '⬆️' : '⬇️'}</div>
              <div style={{ width: 60, height: 2, background: info.isPromotion ? 'var(--orange)' : 'var(--red)' }} />
            </div>

            {/* New role */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4, filter: 'drop-shadow(0 0 8px rgba(240,132,44,0.5))' }}>{nextMeta.icon}</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '15px', fontWeight: 700, color: nextMeta.color }}>
                {nextMeta.label}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>Now</div>
            </div>
          </div>

          {/* Message */}
          <p style={{ fontFamily: 'Rajdhani', fontSize: '15px', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
            {info.isPromotion
              ? `Welcome to your new role as ${nextMeta.label}. You now have expanded access on M S Gaming.`
              : `Your role on M S Gaming has been updated to ${nextMeta.label}.`}
          </p>

          {/* Note from admin */}
          {info.note && (
            <div style={{
              background: 'rgba(240,132,44,0.06)', border: '1px solid rgba(240,132,44,0.2)',
              borderLeft: '3px solid var(--orange)', padding: '10px 14px', marginBottom: 12,
            }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--orange)', marginBottom: 4 }}>
                NOTE FROM ADMIN
              </div>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                {info.note}
              </p>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={dismiss} style={{
              background: info.isPromotion
                ? 'linear-gradient(135deg, var(--orange), var(--gold))'
                : 'rgba(232,58,58,0.15)',
              border: info.isPromotion ? 'none' : '1px solid rgba(232,58,58,0.4)',
              color: info.isPromotion ? '#0a0a0f' : 'var(--red)',
              padding: '8px 22px',
              fontFamily: 'Barlow Condensed', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              clipPath: info.isPromotion ? 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' : 'none',
            }}>
              Got it
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupIn  { from { opacity:0; transform: translate(-50%,-50%) scale(0.9) } to { opacity:1; transform: translate(-50%,-50%) scale(1) } }
        @keyframes popupOut { from { opacity:1; transform: translate(-50%,-50%) scale(1) } to { opacity:0; transform: translate(-50%,-50%) scale(0.9) } }
      `}</style>
    </>
  )
}
