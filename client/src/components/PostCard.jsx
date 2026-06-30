import { Link } from 'react-router-dom'
import { ThumbsUp, MessageSquare, Eye, Pin } from 'lucide-react'

const CAT_STYLES = {
  'pubg-strategy':  { label: 'PUBG Strategy',  cls: 'badge-pubg' },
  'pubg-clips':     { label: 'PUBG Clips',      cls: 'badge-pubg' },
  'hardware':       { label: 'Hardware',        cls: 'badge-laptop' },
  'events':         { label: 'Events',          cls: 'badge-event' },
  'general':        { label: 'General',         cls: 'badge-general' },
  'introductions':  { label: 'Introductions',   cls: 'badge-phone' },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)     return `${Math.floor(diff)}s ago`
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function PostCard({ post }) {
  const cat = CAT_STYLES[post.category] || CAT_STYLES.general

  return (
    <Link to={`/community/${post._id}`} className="block group">
      <div
        className="gaming-card p-4 flex items-start gap-4"
        style={{ borderLeft: post.isPinned ? '2px solid var(--green)' : undefined }}
      >
        {/* Left — author avatar placeholder */}
        <div
          className="w-10 h-10 shrink-0 flex items-center justify-center font-orbitron font-700 text-xs"
          style={{
            background: 'linear-gradient(135deg, var(--s2), var(--border))',
            border: '1px solid var(--border)',
            color: 'var(--gold)',
          }}
        >
          {post.authorName?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {post.isPinned && (
              <span className="badge badge-pinned flex items-center gap-1">
                <Pin size={9} /> Pinned
              </span>
            )}
            <span className={`badge ${cat.cls}`}>{cat.label}</span>
          </div>

          {/* Title */}
          <h3
            className="font-barlow font-600 text-g-text group-hover:text-g-orange transition-colors leading-snug mb-1 truncate"
            style={{ fontSize: '17px' }}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.content && (
            <p
              className="text-g-muted leading-relaxed line-clamp-1"
              style={{ fontFamily: 'Rajdhani', fontSize: '13px' }}
            >
              {post.content.replace(/[#*_`]/g, '').substring(0, 120)}…
            </p>
          )}

          {/* Footer stats */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span
              className="text-g-gold font-semibold"
              style={{ fontFamily: 'Barlow Condensed', fontSize: '13px' }}
            >
              {post.authorName}
            </span>
            <span className="text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              {timeAgo(post.createdAt)}
            </span>

            <div className="flex items-center gap-3 ml-auto text-g-muted" style={{ fontSize: '12px', fontFamily: 'Barlow Condensed', letterSpacing: '0.05em' }}>
              <span className="flex items-center gap-1">
                <ThumbsUp size={12} className="text-g-orange" />
                {post.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={12} className="text-g-gold" />
                {post.commentCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {post.views || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
