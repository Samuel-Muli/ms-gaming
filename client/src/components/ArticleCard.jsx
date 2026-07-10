import { Link } from 'react-router-dom'
import { Clock, Tag, Star } from 'lucide-react'

const CATEGORY_META = {
  pubg:   { label: 'PUBG',   cls: 'badge-pubg',   path: 'articles' },
  phone:  { label: 'PHONE',  cls: 'badge-phone',  path: 'gaming-phones' },
  laptop: { label: 'LAPTOP', cls: 'badge-laptop', path: 'laptops-consoles' },
  event:  { label: 'EVENT',  cls: 'badge-event',  path: 'upcoming-games' },
}

export default function ArticleCard({ article, size = 'normal', animDelay = 0, highlight = false }) {
  const cat   = CATEGORY_META[article.category] || CATEGORY_META.pubg
  const href  = `/${cat.path}/${article.slug}`
  const large = size === 'large'

  return (
    <Link to={href} className="block group">
      <article
        className={`article-card-wrap overflow-hidden h-full ${large ? 'flex flex-col md:flex-row' : ''} ${highlight ? 'article-card-featured' : ''}`}
        style={{
          background: 'var(--surface)',
          border: highlight
            ? '1px solid rgba(240,132,44,0.38)'
            : '1px solid var(--border)',
          position: 'relative',
          // Corner brackets
        }}
      >
        {/* Gaming corner decorators */}
        {['tl','br'].map(pos => (
          <div key={pos} style={{
            position: 'absolute', zIndex: 2, width: 10, height: 10,
            borderColor: highlight ? 'var(--orange)' : 'rgba(240,132,44,0.4)',
            borderStyle: 'solid',
            ...(pos === 'tl' ? { top: -1, left: -1, borderWidth: '2px 0 0 2px' } : { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' }),
            transition: 'all 0.25s ease',
          }} />
        ))}

        {/* Thumbnail */}
        <div
          className={`article-thumb-shimmer relative shrink-0 ${large ? 'md:w-80 h-52 md:h-auto' : 'h-44'}`}
          style={{
            overflow: 'hidden',
            background: article.thumbUrl
              ? undefined
              : `linear-gradient(135deg, ${article.thumbColor || 'var(--s2)'} 0%, var(--bg) 100%)`,
          }}
        >
          {/* Real image if available */}
          {article.thumbUrl ? (
            <img
              src={article.thumbUrl}
              alt={article.title}
              className="article-thumb-img w-full h-full"
              style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }}
              loading="lazy"
            />
          ) : (
            <>
              <div className="absolute inset-0 grid-overlay opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="font-orbitron font-900 text-gradient opacity-20 select-none"
                  style={{ fontSize: large ? '80px' : '56px' }}
                >
                  {article.thumbIcon || article.title.charAt(0)}
                </div>
              </div>
            </>
          )}

          {/* Gradient overlay on image */}
          {article.thumbUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,10,15,0.6) 0%, transparent 50%)',
              pointerEvents: 'none',
            }} />
          )}

          {/* Featured badge */}
          {highlight && (
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
              <span className="badge-featured flex items-center gap-1">
                <Star size={8} fill="currentColor" /> TOP
              </span>
            </div>
          )}

          {/* Category badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3 }}>
            <span className={`badge ${cat.cls}`}>{cat.label}</span>
          </div>

          {/* Read time */}
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            display: 'flex', alignItems: 'center', gap: 4, zIndex: 3,
            fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.05em',
            color: '#c8c8d8', textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}>
            <Clock size={10} />
            {article.readTime} MIN READ
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 flex flex-col gap-2 flex-1 ${large ? 'p-6 justify-center' : ''}`}>
          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map(t => (
                <span key={t} style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontFamily: 'Barlow Condensed', fontSize: '10px', letterSpacing: '0.08em',
                  color: 'var(--muted)',
                }}>
                  <Tag size={9} style={{ color: 'var(--orange)' }} />
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className={`font-barlow font-700 text-g-text group-hover:text-g-orange transition-colors leading-tight ${large ? 'text-2xl' : 'text-lg'}`}
            style={{ transition: 'color 0.2s ease' }}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-g-muted leading-relaxed line-clamp-2"
              style={{ fontFamily: 'Rajdhani', fontSize: '14px' }}>
              {article.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-g-gold font-semibold"
              style={{ fontFamily: 'Barlow Condensed', fontSize: '13px' }}>
              {article.author}
            </span>
            <span className="text-g-muted"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              {article.publishedAt}
            </span>
          </div>

          {large && (
            <div className="mt-3">
              <span className="btn btn-ghost text-xs">Read Article →</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
