import { Monitor } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { laptopArticles } from '../data/laptops'

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
        <div className="flex flex-wrap gap-2 mt-5">
          {[['laptops','Laptops'],['ps5','PlayStation'],['xbox','Xbox'],['switch','Nintendo'],['pc','PC']].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="btn btn-ghost text-xs px-3 py-1.5" style={{ color: 'var(--gold)', borderColor: 'rgba(200,160,68,0.4)' }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <div id="laptops" className="mb-10">
          <div className="section-label mb-4" style={{ color: 'var(--gold)' }}>Featured</div>
          <ArticleCard article={featured} size="large" />
        </div>
      )}

      {/* ALL articles */}
      <div id="ps5">
        <div className="section-label mb-4" style={{ color: 'var(--gold)' }}>All Articles ({laptopArticles.length})</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((a, i) => (
          <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <ArticleCard article={a} />
          </div>
        ))}
      </div>

      <div id="xbox" className="mt-10 gaming-card gold-card p-6 text-center" style={{ background: 'rgba(200,160,68,0.03)' }}>
        <Monitor size={28} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
          PC build guides and console comparisons coming soon.{' '}
          <Link to="/community?cat=hardware" style={{ color: 'var(--gold)' }}>Discuss hardware in the community.</Link>
        </p>
      </div>
    </div>
  )
}
