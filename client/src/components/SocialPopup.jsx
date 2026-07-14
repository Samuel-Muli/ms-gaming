import { useState, useEffect } from 'react'
import { X, Bell } from 'lucide-react'
import PlayerCard from './PlayerCard'

/* ── Social icon SVGs (compact) ── */
const SvgFB  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const SvgX   = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const SvgIG  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="var(--surface)"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round"/></svg>
const SvgLI  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
const SvgGH  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
const SvgTK  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77.01 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.13 6.3 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.02-8.37a8.22 8.22 0 0 0 4.82 1.53V5.05a4.85 4.85 0 0 1-1.03-.36z"/></svg>
const SvgWA  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.5 5.5 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>

const SOCIALS = [
  { Icon: SvgWA, href: 'https://wa.me/254705244235',                          label: 'WhatsApp',  color: '#25D366' },
  { Icon: SvgFB, href: 'https://web.facebook.com/samu.muli.92',              label: 'Facebook',  color: '#1877F2' },
  { Icon: SvgX,  href: 'https://x.com/Kithome_SaMu',                        label: 'X',         color: '#e7e7e7' },
  { Icon: SvgIG, href: 'https://www.instagram.com/dulcet265',               label: 'Instagram', color: '#E1306C' },
  { Icon: SvgLI, href: 'https://www.linkedin.com/in/muli-samuel-442259344', label: 'LinkedIn',  color: '#0A66C2' },
  { Icon: SvgGH, href: 'https://github.com/Samuel-Muli',                    label: 'GitHub',    color: '#E8E8F0' },
  { Icon: SvgTK, href: 'https://www.tiktok.com/@muli.samuel',               label: 'TikTok',    color: '#EE1D52' },
]

const SESSION_KEY = 'msg-social-popup-dismissed'
const DELAY_MS    = 2500

export default function SocialPopup() {
  const [visible,   setVisible]   = useState(false)
  const [closing,   setClosing]   = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    const t = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setClosing(true)
    sessionStorage.setItem(SESSION_KEY, '1')
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} style={{
        position: 'fixed', inset: 0, zIndex: 800,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.25s ease',
      }} />

      {/* Panel — compact on mobile, normal on desktop */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 801,
        width: isMobile ? 'min(92vw, 320px)' : 'min(92vw, 520px)',
        maxHeight: '88vh',
        overflowY: 'auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: '3px solid var(--orange)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        animation: closing
          ? 'popupOut 0.3s ease forwards'
          : 'popupIn 0.38s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        {/* Close button */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          background: 'var(--s2)', border: '1px solid var(--border)',
          color: 'var(--muted)', width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <X size={13} />
        </button>

        {/* Header */}
        <div style={{
          padding: isMobile ? '14px 16px 10px' : '16px 20px 12px',
          borderBottom: '1px solid var(--border)', background: 'var(--s2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <Bell size={13} style={{ color: 'var(--orange)' }} />
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--orange)' }}>
              STAY IN THE LOOP
            </span>
          </div>
          <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: isMobile ? 14 : 18, color: 'var(--text)', margin: 0 }}>
            Follow{' '}
            <span style={{ background: 'linear-gradient(135deg,var(--orange),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              【M。S】
            </span>
          </h2>
          {!isMobile && (
            <p style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--muted)', margin: '5px 0 0' }}>
              PUBG tips, gaming news, and community updates across all platforms.
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? '14px 16px' : '16px 20px' }}>
          {/* Desktop only: player card */}
          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', height: 288, width: 208 }}>
                <PlayerCard />
              </div>
            </div>
          )}

          {/* Social links grid — 2 cols on mobile, auto-fill on desktop */}
          <p style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
            Find me on
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: isMobile ? 6 : 8,
          }}>
            {SOCIALS.map(({ Icon, href, label, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: isMobile ? '7px 10px' : '8px 12px',
                  background: 'var(--s2)', border: '1px solid var(--border)',
                  color: 'var(--muted)', textDecoration: 'none',
                  fontFamily: 'Barlow Condensed', fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 600, letterSpacing: '0.03em', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <span style={{ color, flexShrink: 0 }}><Icon /></span>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: isMobile ? '10px 16px' : '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={dismiss} style={{
            background: 'linear-gradient(135deg,var(--orange),var(--gold))',
            border: 'none', color: '#0a0a0f',
            padding: isMobile ? '7px 18px' : '8px 24px',
            fontFamily: 'Barlow Condensed', fontSize: isMobile ? '12px' : '13px',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
          }}>
            Got it!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popupIn  { from { opacity:0; transform:translate(-50%,-50%) scale(0.9) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
        @keyframes popupOut { from { opacity:1; transform:translate(-50%,-50%) scale(1) } to { opacity:0; transform:translate(-50%,-50%) scale(0.9) } }
        @keyframes fadeOut  { from { opacity:1 } to { opacity:0 } }
      `}</style>
    </>
  )
}
