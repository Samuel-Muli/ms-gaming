import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import { articles } from '../data/articles'

// Sort by date descending — most recent first
const sorted = [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
const mostRecent = sorted[0]

// Filter definitions — each maps to tag keywords
const FILTERS = [
  { id: 'all',      label: 'All',           match: null },
  { id: 'updates',  label: '⚡ Updates',     match: ['Update', 'Ninjas Assemble', 'Evolving Universe', 'Anniversary'] },
  { id: 'weapons',  label: '🔫 Weapons',     match: ['Weapons', 'Meta', 'Loadout'] },
  { id: 'strategy', label: '⚔️ Strategy',    match: ['Strategy', 'Guide', 'Tips', 'Gyroscope', 'Settings', 'FPS', 'Controller', 'Metro Royale'] },
  { id: 'events',   label: '🏆 Events',      match: ['Esports', 'PMGC', 'PMWC', 'Collaboration', 'Events', 'AESPA'] },
  { id: 'pass',     label: '🎫 Royale Pass', match: ['Royale Pass', 'Rewards', 'Prize Path', 'X-Suit'] },
]

function filterArticles(arts, filterId) {
  if (filterId === 'all') return arts
  const f = FILTERS.find(f => f.id === filterId)
  if (!f?.match) return arts
  return arts.filter(a =>
    a.tags?.some(t => f.match.some(kw => t.toLowerCase().includes(kw.toLowerCase()))) ||
    a.title?.toLowerCase().includes(filterId) ||
    f.match.some(kw => a.title?.includes(kw))
  )
}

export default function PubgArticles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeFilter = searchParams.get('filter') || 'all'

  const filtered = useMemo(() => filterArticles(sorted, activeFilter), [activeFilter])

  // Featured hero: most recent among filtered (or just most recent overall)
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

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mt-5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="btn text-xs px-3 py-1.5 transition-all"
              style={{
                fontFamily: 'Barlow Condensed',
                letterSpacing: '0.05em',
                background:   activeFilter === f.id ? 'rgba(240,132,44,0.15)' : 'transparent',
                color:        activeFilter === f.id ? 'var(--orange)' : 'var(--muted)',
                border:       `1px solid ${activeFilter === f.id ? 'rgba(240,132,44,0.5)' : 'var(--border)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', marginTop: 8 }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''} {activeFilter !== 'all' ? `in this category` : 'total'}
        </p>
      </div>

      {/* Hero — most relevant featured article */}
      {hero && (
        <div className="mb-10">
          <div className="section-label mb-4">
            {activeFilter === 'all' ? 'Latest' : 'Featured'}
          </div>
          <ArticleCard article={hero} size="large" highlight={!!hero.featured} />
        </div>
      )}

      {/* All remaining articles */}
      {grid.length > 0 && (
        <>
          <div className="section-label mb-4">
            {activeFilter === 'all' ? `All Articles (${articles.length})` : `More in this category`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((a, i) => (
              <div key={a.slug} className="card-reveal" style={{ animationDelay: `${i * 0.04}s` }}>
                <ArticleCard article={a} highlight={!!a.featured} />
              </div>
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div className="gaming-card p-10 text-center">
          <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)', marginBottom: 12 }}>
            No articles in this category yet.
          </p>
          <button onClick={() => setFilter('all')} className="btn btn-ghost text-sm">
            Show all articles
          </button>
        </div>
      )}
    </div>
  )
}
