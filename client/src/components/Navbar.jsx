import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Menu, X, ChevronDown, Crosshair, Shield } from 'lucide-react'
import { useRole } from '../hooks/useRole'

const NAV_LINKS = [
  {
    label: 'Gaming Phones',
    path: '/gaming-phones',
    items: [
      { label: 'Android Gaming Phones', path: '/gaming-phones#android' },
      { label: 'iPhone for Gaming',     path: '/gaming-phones#iphone' },
      { label: 'Budget Gaming Phones',  path: '/gaming-phones#budget' },
      { label: 'All Phone Reviews',     path: '/gaming-phones' },
    ],
  },
  {
    label: 'Laptops & Consoles',
    path: '/laptops-consoles',
    items: [
      { label: 'Gaming Laptops',        path: '/laptops-consoles#laptops' },
      { label: 'PlayStation 5 / PS5 Pro', path: '/laptops-consoles#ps5' },
      { label: 'Xbox Series X',         path: '/laptops-consoles#xbox' },
      { label: 'Nintendo Switch',       path: '/laptops-consoles#switch' },
      { label: 'PC Builds',             path: '/laptops-consoles#pc' },
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

function DropdownItem({ label, path }) {
  return (
    <Link
      to={path}
      className="block px-4 py-2.5 text-g-muted hover:text-g-text hover:bg-g-surface2 transition-colors"
      style={{ fontFamily: 'Rajdhani', fontSize: '14px' }}
    >
      <span className="text-g-orange mr-1.5" style={{ fontSize: '10px' }}>▸</span>
      {label}
    </Link>
  )
}

function NavItem({ link, mobile = false, onClose }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (mobile) {
    return (
      <div>
        <Link
          to={link.path}
          className="block px-4 py-3 font-barlow text-base font-600 uppercase tracking-wider text-g-text hover:text-g-orange transition-colors"
          onClick={onClose}
        >
          {link.label}
        </Link>
        {link.items && (
          <div className="pl-6 border-l border-g-border ml-4 mb-2">
            {link.items.map(i => (
              <Link
                key={i.label}
                to={i.path}
                className="block py-1.5 text-g-muted hover:text-g-orange transition-colors"
                style={{ fontFamily: 'Rajdhani', fontSize: '14px' }}
                onClick={onClose}
              >
                {i.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1 font-barlow text-sm font-600 uppercase tracking-wider text-g-muted hover:text-g-text transition-colors py-2 px-1"
        onClick={() => setOpen(o => !o)}
        style={{ letterSpacing: '0.06em' }}
      >
        {link.label}
        {link.items && (
          <ChevronDown
            size={13}
            className="transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
        )}
      </button>

      {open && link.items && (
        <div className="dropdown-menu" onClick={() => setOpen(false)}>
          {link.items.map(i => <DropdownItem key={i.label} {...i} />)}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAdmin, isModerator } = useRole()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-open', mobileOpen)
    return () => document.body.classList.remove('mobile-nav-open')
  }, [mobileOpen])

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-g-border"
      style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <Crosshair
              size={28}
              className="text-g-orange"
              style={{ filter: 'drop-shadow(0 0 6px rgba(240,132,44,0.6))' }}
            />
          </div>
          <div className="leading-none">
            <div
              className="font-orbitron font-900 text-gradient"
              style={{ fontSize: '18px', letterSpacing: '-0.01em' }}
            >
              M S GAMING
            </div>
            <div
              className="font-barlow text-g-muted uppercase tracking-widest"
              style={{ fontSize: '9px', letterSpacing: '0.25em' }}
            >
              PUBG Community Hub
            </div>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <NavItem key={link.label} link={link} />
          ))}
          {isModerator && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1 font-barlow text-sm font-600 uppercase tracking-wider py-2 px-1 transition-colors ${
                  isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'
                }`
              }
              style={{ letterSpacing: '0.06em' }}
            >
              <Shield size={13} className="text-g-orange" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* ── Auth ── */}
        <div className="flex items-center gap-3 shrink-0">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary" style={{ height: '36px', paddingTop: 0, paddingBottom: 0 }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 ring-2 ring-g-orange ring-offset-1 ring-offset-g-bg',
                },
              }}
            />
          </SignedIn>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-g-text hover:text-g-orange transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          className="lg:hidden bg-g-surface border-t border-g-border"
          style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          {NAV_LINKS.map(link => (
            <NavItem key={link.label} link={link} mobile onClose={() => setMobileOpen(false)} />
          ))}
          {isModerator && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-3 font-barlow text-base font-600 uppercase tracking-wider text-g-orange"
              onClick={() => setMobileOpen(false)}
            >
              <Shield size={14} /> Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
