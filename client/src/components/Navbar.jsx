import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { Menu, X, ChevronDown, Crosshair, Shield, Sun, Moon, RefreshCw, Home, Flame } from 'lucide-react'
import { useRole } from '../hooks/useRole'
import { useTheme } from '../context/ThemeContext'

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'ctrl-panel-x9m2f7'

// Home → PUBG → Games & Events → Gaming Phones → Laptops & Consoles → Community
const NAV_LINKS = [
  {
    label: 'PUBG',
    path: '/pubg-articles',
    items: [
      { label: 'All PUBG Articles',    path: '/pubg-articles' },
      { label: 'Season Updates',       path: '/pubg-articles?filter=updates' },
      { label: 'Weapon Meta',          path: '/pubg-articles?filter=weapons' },
      { label: 'Strategy & Tips',      path: '/pubg-articles?filter=strategy' },
      { label: 'Events & Collabs',     path: '/pubg-articles?filter=events' },
    ],
  },
  {
    label: 'Games & Events',
    path: '/upcoming-games',
    items: [
      { label: 'Upcoming Releases',    path: '/upcoming-games#releases' },
      { label: 'PUBG Updates',         path: '/upcoming-games#pubg' },
      { label: 'Tournaments',          path: '/upcoming-games#tournaments' },
      { label: 'Gaming Expos',         path: '/upcoming-games#expos' },
    ],
  },
  {
    label: 'Gaming Phones',
    path: '/gaming-phones',
    items: [
      { label: 'All Phone Reviews',      path: '/gaming-phones' },
      { label: 'Android Gaming Phones', path: '/gaming-phones?filter=android' },
      { label: 'iPhone for Gaming',     path: '/gaming-phones?filter=iphone' },
      { label: 'Budget Gaming Phones',  path: '/gaming-phones?filter=budget' },
      { label: 'Flagship Phones',       path: '/gaming-phones?filter=flagship' },
    ],
  },
  {
    label: 'Laptops & Consoles',
    path: '/laptops-consoles',
    items: [
      { label: 'Gaming Laptops',           path: '/laptops-consoles#laptops' },
      { label: 'PlayStation 5 / PS5 Pro',  path: '/laptops-consoles#consoles' },
      { label: 'Xbox Series X',            path: '/laptops-consoles#consoles' },
      { label: 'PC Builds',                path: '/laptops-consoles#pc-builds' },
    ],
  },
  {
    label: 'Community',
    path: '/community',
    items: [
      { label: 'All Discussions',      path: '/community' },
      { label: 'PUBG Strategies',      path: '/community?cat=pubg-strategy' },
      { label: 'Hardware Talk',        path: '/community?cat=hardware' },
      { label: 'Introductions',        path: '/community?cat=introductions' },
    ],
  },
]

/* ── Desktop dropdown ────────────────────────────────────────────────────────── */
function DesktopNavItem({ link }) {
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const show = () => { clearTimeout(timer.current); setOpen(true) }
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 180) }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} style={{ isolation: 'isolate' }}>
      <NavLink
        to={link.path}
        className={({ isActive }) =>
          `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2.5 text-sm transition-colors ${isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'}`
        }
        style={{ letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
      >
        {link.label}
        {link.items && (
          <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
        )}
      </NavLink>
      {open && link.items && (
        <div className="dropdown-menu" onMouseEnter={show} onMouseLeave={hide} style={{ zIndex: 9999 }}>
          {link.items.map(item => (
            <Link key={item.label} to={item.path} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 transition-colors"
              style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              <span style={{ color: 'var(--orange)', marginRight: 6, fontSize: 10 }}>▸</span>{item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Mobile accordion ────────────────────────────────────────────────────────── */
function MobileNavItem({ link, onClose }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        className="flex items-center justify-between w-full font-barlow font-600 uppercase tracking-wider"
        style={{
          padding: '12px 18px', color: 'var(--text)', background: 'none',
          border: 'none', cursor: 'pointer', letterSpacing: '0.08em', fontSize: '13px',
        }}
        onClick={() => { if (link.items) { setOpen(o => !o) } else { onClose() } }}
      >
        {link.items ? <span>{link.label}</span> : <Link to={link.path} onClick={onClose} style={{ color: 'inherit' }}>{link.label}</Link>}
        {link.items && <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--orange)', flexShrink: 0 }} />}
      </button>
      {open && link.items && (
        <div style={{ background: 'var(--s2)', borderTop: '1px solid var(--border)' }}>
          <Link to={link.path} onClick={onClose} className="block px-8 py-2.5"
            style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--orange)', fontWeight: 700 }}>
            ▸ View All
          </Link>
          {link.items.map(item => (
            <Link key={item.label} to={item.path} onClick={onClose} className="block px-8 py-2"
              style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              <span style={{ color: 'var(--orange)', marginRight: 6, fontSize: 9 }}>▸</span>{item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isModerator, isLoaded } = useRole()
  const { toggle: toggleTheme, isDark } = useTheme()
  const { user, isSignedIn } = useUser()
  const [refreshing, setRefreshing] = useState(false)

  const refreshRole = async () => {
    setRefreshing(true)
    try { await user?.reload() } catch {}
    setTimeout(() => setRefreshing(false), 1000)
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-50 w-full" style={{
        background: isDark ? 'rgba(10,10,15,0.97)' : 'rgba(240,242,248,0.97)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
        overflow: 'visible',
      }}>
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4" style={{ overflow: 'visible' }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Crosshair size={28} style={{ color: 'var(--orange)', filter: 'drop-shadow(0 0 6px rgba(240,132,44,0.6))', flexShrink: 0 }} />
            <div className="leading-none">
              <div className="font-orbitron font-900 text-gradient" style={{ fontSize: '17px', whiteSpace: 'nowrap' }}>M S GAMING</div>
              <div className="font-barlow uppercase" style={{ fontSize: '9px', letterSpacing: '0.25em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>PUBG Community Hub</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0" style={{ overflow: 'visible' }}>
            <NavLink to="/" end
              className={({ isActive }) =>
                `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2.5 text-sm transition-colors ${isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'}`
              }
              style={{ letterSpacing: '0.06em' }}>
              <Home size={13} /> Home
            </NavLink>
            {NAV_LINKS.map(link => <DesktopNavItem key={link.label} link={link} />)}
            {isLoaded && isModerator && (
              <NavLink to={`/${ADMIN_PATH}`}
                className={({ isActive }) =>
                  `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2.5 text-sm transition-colors ${isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'}`
                }
                style={{ letterSpacing: '0.06em' }}>
                <Shield size={13} style={{ color: 'var(--orange)' }} /> Admin
              </NavLink>
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {isSignedIn && (
              <button className="theme-toggle" onClick={refreshRole} title="Refresh role">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            )}
            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className="btn btn-primary" style={{ height: '36px', paddingTop: 0, paddingBottom: 0 }}>Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8 ring-2 ring-g-orange ring-offset-1' } }} />
            </SignedIn>
            <button className="lg:hidden theme-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — 40% from right, rounded left edge, auto height */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 299, backdropFilter: 'blur(3px)',
            animation: 'fadeIn 0.22s ease',
          }} />

          <div style={{
            position: 'fixed',
            top: 0, right: 0,
            width: 'min(40vw, 300px)',
            minWidth: 200,
            maxHeight: '100vh',
            overflowY: 'auto',
            zIndex: 300,
            background: 'var(--surface)',
            borderLeft: '2px solid var(--orange)',
            borderBottomLeftRadius: 16,
            borderTopLeftRadius: 0,
            boxShadow: '-8px 0 40px rgba(0,0,0,0.55)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'drawerSlideIn 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--s2)',
            }}>
              <span className="font-orbitron font-700 text-gradient" style={{ fontSize: '13px' }}>MENU</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable nav items */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Home */}
              <div style={{ borderBottom: '1px solid var(--border)' }}>
                <Link to="/" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 font-barlow font-600 uppercase tracking-wider"
                  style={{ padding: '12px 18px', color: 'var(--orange)', letterSpacing: '0.08em', fontSize: '13px', textDecoration: 'none' }}>
                  <Home size={13} /> Home
                </Link>
              </div>
              {NAV_LINKS.map(link => <MobileNavItem key={link.label} link={link} onClose={() => setMobileOpen(false)} />)}
              {isLoaded && isModerator && (
                <div style={{ borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/${ADMIN_PATH}`} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 font-barlow font-600 uppercase tracking-wider"
                    style={{ padding: '12px 18px', color: 'var(--orange)', letterSpacing: '0.08em', fontSize: '13px', textDecoration: 'none' }}>
                    <Shield size={13} /> Admin
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom — theme toggle + auth (always visible, ends here) */}
            <div style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--border)',
              background: 'var(--s2)',
              borderBottomLeftRadius: 14,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <button onClick={toggleTheme}
                className="flex items-center gap-2 font-barlow uppercase tracking-wider"
                style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', fontSize: '12px' }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="btn btn-primary w-full justify-center" style={{ fontSize: '12px', height: 34, paddingTop: 0, paddingBottom: 0 }}>Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2">
                  <UserButton />
                  <span className="font-barlow" style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.firstName || 'Account'}
                  </span>
                </div>
              </SignedIn>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
