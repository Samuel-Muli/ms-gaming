import { Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { phoneArticles } from '../data/phones'

export default function GamingPhones() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="mb-10 pb-6 border-b border-g-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(58,138,232,0.1)', border: '1px solid rgba(58,138,232,0.2)' }}>
            <Smartphone size={20} style={{ color: 'var(--blue)' }} />
          </div>
          <span className="section-label">Hardware</span>
        </div>
        <h1 className="font-barlow font-800 text-3xl md:text-4xl text-g-text uppercase tracking-wide mb-2">Gaming Phones</h1>
        <p className="text-g-muted max-w-xl" style={{ fontFamily: 'Rajdhani', fontSize: '16px' }}>
          Reviews, rankings, and buying guides for the best phones to play PUBG Mobile and other titles at peak performance.
        </p>
      </div>

      {/* Featured article */}
      {phoneArticles[0] && (
        <div id="android" className="mb-10">
          <div className="section-label mb-4">Featured Review</div>
          <ArticleCard article={phoneArticles[0]} size="large" />
        </div>
      )}

      {/* Grid */}
      <div id="iphone" className="mb-4">
        <div className="section-label mb-4">All Phone Articles</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {phoneArticles.slice(1).map((a, i) => (
          <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <ArticleCard article={a} />
          </div>
        ))}
      </div>

      {/* No more articles notice */}
      <div
        id="budget"
        className="mt-10 gaming-card p-6 text-center"
        style={{ background: 'rgba(58,138,232,0.03)' }}
      >
        <Smartphone size={28} style={{ color: 'var(--blue)', margin: '0 auto 12px' }} />
        <p className="text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
          More phone reviews dropping soon. Check back or{' '}
          <Link to="/community" className="text-g-orange hover:underline">ask in the community</Link>.
        </p>
      </div>
    </div>
  )
}
