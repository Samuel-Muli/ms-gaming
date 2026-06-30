import { Link } from 'react-router-dom'
import { Crosshair, ExternalLink, MessageCircle, Phone } from 'lucide-react'

/* ── Social icon SVGs ───────────────────────────────────────────────────── */
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="var(--surface)"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const IconGitHub = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
)
const IconTikTok = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.02-8.37a8.22 8.22 0 0 0 4.82 1.53V5.05a4.85 4.85 0 0 1-1.03-.36z"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)

const SOCIALS = [
  { Icon: IconWhatsApp,  href: 'https://wa.me/254705244235',                                     label: 'WhatsApp',  color: '#25D366' },
  { Icon: IconFacebook,  href: 'https://web.facebook.com/samu.muli.92',                          label: 'Facebook',  color: '#1877F2' },
  { Icon: IconX,         href: 'https://x.com/Kithome_SaMu',                                    label: 'X',         color: '#E7E7E7' },
  { Icon: IconInstagram, href: 'https://www.instagram.com/dulcet265',                            label: 'Instagram', color: '#E1306C' },
  { Icon: IconLinkedIn,  href: 'https://www.linkedin.com/in/muli-samuel-442259344',              label: 'LinkedIn',  color: '#0A66C2' },
  { Icon: IconGitHub,    href: 'https://github.com/Samuel-Muli',                                label: 'GitHub',    color: '#E8E8F0' },
  { Icon: IconTikTok,    href: 'https://www.tiktok.com/@muli.samuel',                           label: 'TikTok',    color: '#EE1D52' },
]

const NAV_COLS = {
  'PUBG Hub': [
    { label: 'Latest Articles',   to: '/articles/pubg-season-2025' },
    { label: 'Upcoming Events',   to: '/upcoming-games' },
    { label: 'Strategy Guides',   to: '/community?cat=pubg-strategy' },
    { label: 'Weapon Loadouts',   to: '/articles/best-weapon-loadouts-ranked' },
  ],
  'Hardware': [
    { label: 'Gaming Phones',     to: '/gaming-phones' },
    { label: 'Gaming Laptops',    to: '/laptops-consoles#laptops' },
    { label: 'Consoles',          to: '/laptops-consoles#ps5' },
    { label: 'PC Builds',         to: '/laptops-consoles#pc' },
  ],
  'Community': [
    { label: 'Discussions',       to: '/community' },
    { label: 'PUBG Strategy',     to: '/community?cat=pubg-strategy' },
    { label: 'Introductions',     to: '/community?cat=introductions' },
    { label: 'Hardware Talk',     to: '/community?cat=hardware' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      {/* Orange accent line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--orange), var(--gold), transparent)' }} />

      <div className="max-w-screen-2xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* ── Founder column ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <Crosshair size={24} style={{ color: 'var(--orange)', filter: 'drop-shadow(0 0 6px rgba(240,132,44,0.5))' }} />
              <span className="font-orbitron font-900 text-gradient" style={{ fontSize: '16px' }}>M S GAMING</span>
            </Link>

            {/* Founder bio */}
            <div
              className="gaming-card p-4 mb-5"
              style={{ borderLeft: '2px solid var(--orange)', background: 'var(--s2)' }}
            >
              <p className="font-barlow font-700 uppercase tracking-wider mb-1" style={{ fontSize: '11px', color: 'var(--orange)', letterSpacing: '0.15em' }}>
                ▸ Founder
              </p>
              <p className="font-orbitron font-700" style={{ fontSize: '16px', color: 'var(--gold)' }}>【M。S】</p>
              <p className="text-sm leading-relaxed mt-2" style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
                Active PUBG Battlegrounds player &amp; founder of M S Gaming. Building a community for gamers who love to learn, compete, and connect.
              </p>
            </div>

            {/* Social icons */}
            <p className="font-barlow font-600 uppercase tracking-widest mb-3" style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
              Find me on
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map(({ Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 flex items-center justify-center transition-all"
                  style={{
                    background: 'var(--s2)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                    borderRadius: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = color
                    e.currentTarget.style.borderColor = color
                    e.currentTarget.style.boxShadow = `0 0 10px ${color}44`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/254705244235"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-4 text-sm transition-colors"
              style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', color: '#25D366', letterSpacing: '0.04em' }}
            >
              <Phone size={12} /> Chat on WhatsApp
            </a>
          </div>

          {/* ── Nav columns ─────────────────────────────────────── */}
          {Object.entries(NAV_COLS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-barlow font-600 uppercase tracking-widest mb-4" style={{ fontSize: '12px', color: 'var(--text)', letterSpacing: '0.15em' }}>
                <span style={{ color: 'var(--orange)', marginRight: 4 }}>▸</span>{section}
              </h4>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm transition-colors"
                      style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
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
        <div
          className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
            © {new Date().getFullYear()} M S Gaming. Built &amp; operated by <span style={{ color: 'var(--gold)' }}>【M。S】</span>.
          </p>
          <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
            <a href="https://pubg.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" style={{ color: 'var(--muted)' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
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
