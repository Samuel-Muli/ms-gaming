import { Link } from 'react-router-dom'
import { Crosshair, Youtube, Twitch, Twitter, MessageCircle, ExternalLink } from 'lucide-react'

const LINKS = {
  'PUBG Hub': [
    { label: 'PUBG Articles',   to: '/articles/pubg-season-2025' },
    { label: 'Upcoming Events', to: '/upcoming-games' },
    { label: 'Strategy Guides', to: '/community?cat=pubg-strategy' },
  ],
  'Hardware': [
    { label: 'Gaming Phones',   to: '/gaming-phones' },
    { label: 'Laptops',         to: '/laptops-consoles#laptops' },
    { label: 'Consoles',        to: '/laptops-consoles#ps5' },
  ],
  'Community': [
    { label: 'Discussion',      to: '/community' },
    { label: 'Introductions',   to: '/community?cat=introductions' },
    { label: 'Hardware Talk',   to: '/community?cat=hardware' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-g-border mt-auto" style={{ background: '#0d0d14' }}>
      {/* Orange line accent */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #F0842C, #C8A044, transparent)' }} />

      <div className="max-w-screen-2xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Crosshair size={24} className="text-g-orange" style={{ filter: 'drop-shadow(0 0 6px rgba(240,132,44,0.5))' }} />
              <span className="font-orbitron font-900 text-gradient" style={{ fontSize: '16px' }}>M S GAMING</span>
            </Link>
            <p className="text-g-muted text-sm leading-relaxed mb-5" style={{ fontFamily: 'Rajdhani' }}>
              A PUBG-focused gaming community and hub built by{' '}
              <span className="text-g-gold font-semibold">【M。S】</span>.
              Covering PUBG news, gaming hardware, events, and community discussion.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {[
                { Icon: Twitter,       href: '#', col: '#8888AA' },
                { Icon: Youtube,       href: '#', col: '#E83A3A' },
                { Icon: Twitch,        href: '#', col: '#9B59B6' },
                { Icon: MessageCircle, href: '#', col: '#5865F2' },
              ].map(({ Icon, href, col }) => (
                <a
                  key={col}
                  href={href}
                  className="w-8 h-8 flex items-center justify-center border border-g-border transition-all hover:scale-110"
                  style={{ color: '#8888AA' }}
                  onMouseEnter={e => { e.currentTarget.style.color = col; e.currentTarget.style.borderColor = col }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8888AA'; e.currentTarget.style.borderColor = '#2a2a3a' }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                className="font-barlow text-g-text font-600 uppercase tracking-widest mb-4"
                style={{ fontSize: '13px', letterSpacing: '0.15em' }}
              >
                <span className="text-g-orange mr-1">▸</span> {section}
              </h4>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-g-muted hover:text-g-orange transition-colors text-sm"
                      style={{ fontFamily: 'Rajdhani' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-g-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-g-muted text-sm" style={{ fontFamily: 'Rajdhani' }}>
            © {new Date().getFullYear()} M S Gaming. Built & operated by{' '}
            <span className="text-g-gold">【M。S】</span>.
          </p>
          <div className="flex items-center gap-4 text-sm text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
            <a href="https://pubg.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-g-orange transition-colors">
              PUBG Official <ExternalLink size={11} />
            </a>
            <span>·</span>
            <span>Not affiliated with Krafton.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
