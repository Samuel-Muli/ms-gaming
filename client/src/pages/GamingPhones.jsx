import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Smartphone } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import { phoneArticles } from '../data/phones'

const FILTERS = [
  { id: 'all',      label: 'All Phones' },
  { id: 'android',  label: '🤖 Android',    match: ['Android'] },
  { id: 'iphone',   label: '🍎 iPhone / iOS', match: ['iOS', 'Apple', 'iPhone'] },
  { id: 'flagship', label: '👑 Flagship',   match: ['Flagship', 'ROG Phone', 'RedMagic 10', 'RedMagic 11'] },
  { id: 'budget',   label: '💰 Budget',     match: ['Budget Gaming', 'Infinix', 'Tecno', 'Poco', 'Budget'] },
  { id: 'guide',    label: '📋 Buying Guides', match: ['Buying Guide', 'Ranked'] },
]

function filterPhones(arts, filterId) {
  if (filterId === 'all') return arts
  const f = FILTERS.find(f => f.id === filterId)
  if (!f?.match) return arts
  return arts.filter(a =>
    a.tags?.some(t => f.match.some(kw => t.toLowerCase().includes(kw.toLowerCase()))) ||
    f.match.some(kw => a.title?.toLowerCase().includes(kw.toLowerCase()))
  )
}

export default function GamingPhones() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeFilter = searchParams.get('filter') || 'all'

  const filtered = useMemo(() => filterPhones(phoneArticles, activeFilter), [activeFilter])

  // Show one hero (most recent featured), everything else in grid
  const hero = filtered.find(a => a.featured) || filtered[0]
  const grid = filtered.filter(a => a.slug !== hero?.slug)

  const setFilter = (id) => {
    id === 'all' ? setSearchParams({}) : setSearchParams({ filter: id })
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
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
          Reviews, rankings, and buying guides for the best phones to play PUBG Mobile.
        </p>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mt-5">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="btn text-xs px-3 py-1.5 transition-all"
              style={{
                fontFamily: 'Barlow Condensed', letterSpacing: '0.05em',
                background: activeFilter === f.id ? 'rgba(58,138,232,0.15)' : 'transparent',
                color:      activeFilter === f.id ? 'var(--blue)'           : 'var(--muted)',
                border:     `1px solid ${activeFilter === f.id ? 'rgba(58,138,232,0.5)' : 'var(--border)'}`,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', marginTop: 8 }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' ? ' in this category' : ` · ${phoneArticles.length} total`}
        </p>
      </div>

      {/* Hero */}
      {hero && (
        <div id="android" className="mb-10">
          <div className="section-label mb-4" style={{ color: 'var(--blue)' }}>
            {activeFilter === 'all' ? 'Featured Review' : 'Top Pick'}
          </div>
          <ArticleCard article={hero} size="large" highlight={!!hero.featured} />
        </div>
      )}

      {/* Grid — ALL remaining articles */}
      <div id="iphone">
        {grid.length > 0 && (
          <>
            <div className="section-label mb-4" style={{ color: 'var(--blue)' }}>
              {activeFilter === 'all' ? `All Phone Articles (${phoneArticles.length})` : 'More Articles'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grid.map((a, i) => (
                <div key={a.slug} className="card-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ArticleCard article={a} highlight={!!a.featured} />
                </div>
              ))}
            </div>
          </>
        )}
        {filtered.length === 0 && (
          <div className="gaming-card p-10 text-center">
            <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)', marginBottom: 12 }}>No articles match this filter.</p>
            <button onClick={() => setFilter('all')} className="btn btn-ghost text-sm">Show all</button>
          </div>
        )}
      </div>

      <div id="budget" className="mt-10 gaming-card p-6 text-center" style={{ background: 'rgba(58,138,232,0.03)' }}>
        <Smartphone size={28} style={{ color: 'var(--blue)', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
          More reviews dropping soon.{' '}
          <Link to="/community?cat=hardware" style={{ color: 'var(--orange)' }}>Discuss phones in the community.</Link>
        </p>
      </div>
    </div>
  )
}
