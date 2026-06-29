import { Link } from 'react-router-dom'
import { Clock, Tag } from 'lucide-react'

const CATEGORY_META = {
  pubg:   { label: 'PUBG', cls: 'badge-pubg',   path: 'articles' },
  phone:  { label: 'PHONE', cls: 'badge-phone',  path: 'gaming-phones' },
  laptop: { label: 'LAPTOP', cls: 'badge-laptop', path: 'laptops-consoles' },
  event:  { label: 'EVENT', cls: 'badge-event',  path: 'upcoming-games' },
}

export default function ArticleCard({ article, size = 'normal' }) {
  const cat = CATEGORY_META[article.category] || CATEGORY_META.pubg
  const href = `/${cat.path}/${article.slug}`
  const large = size === 'large'

  return (
    <Link to={href} className="block group">
      <article className={`gaming-card overflow-hidden h-full ${large ? 'flex flex-col md:flex-row' : ''}`}>

        {/* Thumbnail */}
        <div
          className={`relative overflow-hidden shrink-0 ${large ? 'md:w-80 h-52 md:h-auto' : 'h-44'}`}
          style={{
            background: `linear-gradient(135deg, ${article.thumbColor || '#1c1c28'} 0%, #0a0a0f 100%)`,
          }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-overlay opacity-40" />

          {/* Central icon / letter */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="font-orbitron font-900 text-gradient opacity-20 select-none"
              style={{ fontSize: large ? '80px' : '56px' }}
            >
              {article.thumbIcon || article.title.charAt(0)}
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${cat.cls}`}>{cat.label}</span>
          </div>

          {/* Read time */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 text-g-muted"
            style={{ fontSize: '11px', fontFamily: 'Barlow Condensed', letterSpacing: '0.05em' }}
          >
            <Clock size={10} />
            {article.readTime} MIN READ
          </div>

          {/* Hover scan line */}
          <div
            className="absolute inset-x-0 h-px bg-g-orange opacity-0 group-hover:opacity-60 transition-opacity"
            style={{ top: '50%' }}
          />
        </div>

        {/* Content */}
        <div className={`p-4 flex flex-col gap-2 flex-1 ${large ? 'p-6 justify-center' : ''}`}>
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map(t => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-g-muted"
                  style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', letterSpacing: '0.08em' }}
                >
                  <Tag size={9} className="text-g-orange" />
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className={`font-barlow font-700 text-g-text group-hover:text-g-orange transition-colors leading-tight ${large ? 'text-2xl' : 'text-lg'}`}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className="text-g-muted leading-relaxed line-clamp-2"
              style={{ fontFamily: 'Rajdhani', fontSize: '14px' }}
            >
              {article.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span
              className="text-g-gold font-semibold"
              style={{ fontFamily: 'Barlow Condensed', fontSize: '13px' }}
            >
              {article.author}
            </span>
            <span
              className="text-g-muted"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}
            >
              {article.publishedAt}
            </span>
          </div>

          {/* Read more CTA */}
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
