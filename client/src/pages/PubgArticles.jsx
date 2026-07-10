import { Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { articles } from '../data/articles'

export default function PubgArticles() {
  const featured = articles.find(a => a.featured)
  const rest = articles.filter(a => !a.featured)
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center"
            style={{ background: 'rgba(240,132,44,0.1)', border: '1px solid rgba(240,132,44,0.2)' }}>
            <Flame size={20} style={{ color: 'var(--orange)' }} />
          </div>
          <span className="section-label">PUBG Battlegrounds</span>
        </div>
        <h1 className="font-barlow font-800 uppercase tracking-wide text-g-text mb-2"
          style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>
          PUBG Articles
        </h1>
        <p style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)', maxWidth: 560 }}>
          Season updates, strategies, weapon meta, and everything PUBG — written by 【M。S】.
        </p>
      </div>

      {featured && (
        <div className="mb-10">
          <div className="section-label mb-4">Featured</div>
          <ArticleCard article={featured} size="large" />
        </div>
      )}

      <div className="section-label mb-4">All PUBG Articles ({articles.length})</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((a, i) => (
          <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
            <ArticleCard article={a} />
          </div>
        ))}
      </div>
    </div>
  )
}
