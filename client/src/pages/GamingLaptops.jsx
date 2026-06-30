import { Monitor } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { laptopArticles } from '../data/laptops'

const TABS = [
  { id: 'laptops', label: 'Laptops' },
  { id: 'ps5',     label: 'PlayStation' },
  { id: 'xbox',    label: 'Xbox' },
  { id: 'switch',  label: 'Nintendo' },
  { id: 'pc',      label: 'PC Builds' },
]

export default function GamingLaptops() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="mb-10 pb-6 border-b border-g-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(200,160,68,0.1)', border: '1px solid rgba(200,160,68,0.2)' }}>
            <Monitor size={20} className="text-g-gold" />
          </div>
          <span className="section-label" style={{ color: 'var(--gold)' }}>Hardware</span>
        </div>
        <h1 className="font-barlow font-800 text-3xl md:text-4xl text-g-text uppercase tracking-wide mb-2">Laptops & Consoles</h1>
        <p className="text-g-muted max-w-xl" style={{ fontFamily: 'Rajdhani', fontSize: '16px' }}>
          Reviews and buying guides for gaming laptops, PS5, Xbox, Nintendo, and custom PC builds — all evaluated for gaming performance.
        </p>

        {/* Anchor tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {TABS.map(t => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="btn btn-ghost text-xs px-3 py-1.5"
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* Featured */}
      {laptopArticles[0] && (
        <div id="laptops" className="mb-10">
          <div className="section-label mb-4">Featured: Laptops</div>
          <ArticleCard article={laptopArticles[0]} size="large" />
        </div>
      )}

      {/* Rest of articles */}
      <div id="ps5" className="mb-4">
        <div className="section-label mb-4">All Articles</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {laptopArticles.slice(1).map((a, i) => (
          <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <ArticleCard article={a} />
          </div>
        ))}
      </div>

      {/* More soon */}
      <div
        id="xbox"
        className="mt-10 gaming-card gold-card p-6 text-center"
        style={{ background: 'rgba(200,160,68,0.03)' }}
      >
        <Monitor size={28} className="text-g-gold mx-auto mb-3" />
        <p className="text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
          PC build guides and console comparisons coming soon.{' '}
          <Link to="/community?cat=hardware" className="text-g-gold hover:underline">Discuss hardware in the community.</Link>
        </p>
      </div>
    </div>
  )
}
