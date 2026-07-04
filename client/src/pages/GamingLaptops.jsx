import { Monitor, Cpu, Gamepad2, Laptop } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { laptopArticles } from '../data/laptops'

const TABS = [
  { id: 'laptops',   label: '💻 Laptops'     },
  { id: 'consoles',  label: '🎮 Consoles'    },
  { id: 'pc-builds', label: '🖥️ PC Builds'   },
]

export default function GamingLaptops() {
  const featured = laptopArticles.find(a => a.featured)
  const rest = laptopArticles.filter(a => !a.featured)

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center"
            style={{ background: 'rgba(200,160,68,0.1)', border: '1px solid rgba(200,160,68,0.2)' }}>
            <Monitor size={20} style={{ color: 'var(--gold)' }} />
          </div>
          <span className="section-label" style={{ color: 'var(--gold)' }}>Hardware · Laptops &amp; Consoles</span>
        </div>
        <h1 className="font-barlow font-800 uppercase tracking-wide text-g-text mb-2"
          style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>Laptops &amp; Consoles</h1>
        <p style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)', maxWidth: 560 }}>
          Reviews and buying guides for gaming laptops, PS5, Xbox, Nintendo, and custom PC builds.
        </p>
        {/* Anchor tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {TABS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="btn btn-ghost text-xs px-3 py-1.5"
              style={{ color: 'var(--gold)', borderColor: 'rgba(200,160,68,0.4)' }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Laptops section ── */}
      <div id="laptops" className="mb-10">
        <div className="section-label mb-4" style={{ color: 'var(--gold)' }}>Gaming Laptops</div>
        {featured && <ArticleCard article={featured} size="large" />}
      </div>

      {/* All articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {rest.map((a, i) => (
          <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <ArticleCard article={a} />
          </div>
        ))}
      </div>

      {/* ── Consoles section ── */}
      <div id="consoles" className="mb-8">
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
        <div className="section-label mb-4" style={{ color: 'var(--gold)' }}>Consoles</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🎮', title: 'PlayStation 5 Pro', desc: 'Sony\'s latest console with PSSR upscaling and 4K/60fps gaming.', slug: 'ps5-pro-vs-xbox-series-x', badge: 'PS5 PRO' },
            { icon: '⬛', title: 'Xbox Series X',     desc: 'Microsoft\'s powerhouse with Game Pass and 4K native gaming.',  slug: 'ps5-pro-vs-xbox-series-x', badge: 'XBOX' },
            { icon: '🔴', title: 'Nintendo Switch 2', desc: 'Nintendo\'s hybrid console — updated with improved display.',    slug: null,                         badge: 'SWITCH 2' },
          ].map(c => (
            <div key={c.title}
              className={`gaming-card gold-card p-5 ${c.slug ? 'cursor-pointer group' : ''}`}
              onClick={c.slug ? () => window.location.href = `/laptops-consoles/${c.slug}` : undefined}
            >
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <span className="badge badge-laptop">{c.badge}</span>
              </div>
              <h3 className="font-barlow font-700 mb-2" style={{ fontSize: '17px', color: 'var(--text)' }}>{c.title}</h3>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}>{c.desc}</p>
              {c.slug && (
                <p className="mt-3" style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', color: 'var(--gold)', letterSpacing: '0.06em' }}>
                  READ COMPARISON →
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── PC Builds section ── */}
      <div id="pc-builds" className="mb-8">
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
        <div className="section-label mb-4" style={{ color: 'var(--gold)' }}>PC Builds</div>
        <div className="gaming-card gold-card p-6 text-center" style={{ background: 'rgba(200,160,68,0.03)' }}>
          <Cpu size={32} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} />
          <h3 className="font-barlow font-700 mb-2" style={{ fontSize: '18px', color: 'var(--text)' }}>
            PC Build Guides — Coming Soon
          </h3>
          <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)', marginBottom: 16, maxWidth: 420, margin: '0 auto 16px' }}>
            Budget, mid-range, and high-end PC build recommendations for PUBG and gaming — currently in progress.
          </p>
          <Link to="/community?cat=hardware" className="btn btn-ghost text-sm"
            style={{ color: 'var(--gold)', borderColor: 'rgba(200,160,68,0.4)' }}>
            Discuss PC Builds in Community
          </Link>
        </div>
      </div>
    </div>
  )
}
