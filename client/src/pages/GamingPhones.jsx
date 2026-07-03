import { Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { phoneArticles } from '../data/phones'

export default function GamingPhones() {
  const featured = phoneArticles.find(a => a.featured)
  const rest = phoneArticles.filter(a => !a.featured)

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center"
            style={{ background: 'rgba(58,138,232,0.1)', border: '1px solid rgba(58,138,232,0.2)' }}>
            <Smartphone size={20} style={{ color: 'var(--blue)' }} />
          </div>
          <span className="section-label" style={{ color: 'var(--blue)' }}>Hardware · Phones</span>
        </div>
        <h1 className="font-barlow font-800 uppercase tracking-wide text-g-text mb-2"
          style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>Gaming Phones</h1>
        <p style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)', maxWidth: 560 }}>
          Reviews, rankings, and buying guides for the best phones to play PUBG Mobile and other titles at peak performance.
        </p>
        {/* Anchor tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {[['android','Android'], ['iphone','iPhone'], ['budget','Budget']].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="btn btn-ghost text-xs px-3 py-1.5">{label}</a>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <div id="android" className="mb-10">
          <div className="section-label mb-4">Featured Review</div>
          <ArticleCard article={featured} size="large" />
        </div>
      )}

      {/* ALL articles grid */}
      <div id="iphone">
        <div className="section-label mb-4">All Phone Articles ({phoneArticles.length})</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((a, i) => (
          <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <ArticleCard article={a} />
          </div>
        ))}
      </div>

      {/* No more notice */}
      <div id="budget" className="mt-10 gaming-card p-6 text-center" style={{ background: 'rgba(58,138,232,0.03)' }}>
        <Smartphone size={28} style={{ color: 'var(--blue)', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
          More phone reviews dropping soon.{' '}
          <Link to="/community" style={{ color: 'var(--orange)' }}>Ask in the community.</Link>
        </p>
      </div>
    </div>
  )
}
