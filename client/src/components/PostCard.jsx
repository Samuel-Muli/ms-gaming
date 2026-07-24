import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { ThumbsUp, MessageSquare, Eye, Pin, Trash2 } from 'lucide-react'
import { useRole } from '../hooks/useRole'

const CAT_STYLES = {
  'pubg-strategy':  { label: 'PUBG Strategy',  cls: 'badge-pubg'     },
  'pubg-clips':     { label: 'PUBG Clips',      cls: 'badge-pubg'     },
  'hardware':       { label: 'Hardware',        cls: 'badge-laptop'   },
  'card-exchange':  { label: 'Card Exchanges',  cls: 'badge-exchange' },
  'events':         { label: 'Events',          cls: 'badge-event'    },
  'general':        { label: 'General',         cls: 'badge-general'  },
  'introductions':  { label: 'Introductions',   cls: 'badge-phone'    },
}

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000
  if (s < 60)    return `${Math.floor(s)}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(d).toLocaleDateString()
}

export default function PostCard({ post, onDelete }) {
  const navigate = useNavigate()
  const { isSignedIn, getToken, userId } = useAuth()
  const { isModerator } = useRole()

  const [liked,     setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount || post.likes?.length || 0)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)

  const cat     = CAT_STYLES[post.category] || CAT_STYLES.general
  const preview = post.media?.[0]
  const rawText = post.content?.replace(/[#*_`]/g, '').trim() || ''
  const excerpt = rawText.length > 180 ? rawText.slice(0, 180) + '…' : rawText

  // Navigate to post — used on card body click
  const openPost = () => navigate(`/community/${String(post._id)}`)

  const toggleLike = async (e) => {
    e.stopPropagation()
    if (!isSignedIn || saving) return
    setSaving(true)
    try {
      const token = await getToken()
      const res   = await fetch(`/api/posts/${String(post._id)}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data  = await res.json()
      if (res.ok) { setLiked(data.liked); setLikeCount(data.likeCount) }
    } catch {}
    finally { setSaving(false) }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      const token = await getToken()
      const res   = await fetch(`/api/posts/${String(post._id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok && onDelete) onDelete(post._id)
    } catch {}
    finally { setDeleting(false) }
  }

  const isAuthor = isSignedIn && userId === post.authorId
  const canDelete = isAuthor || isModerator

  // Prevent media click from navigating (user might scrub video)
  const stopNav = (e) => e.stopPropagation()

  return (
    <div
      className="pc-card social-feed-card"
      style={{ borderLeft: post.isPinned ? '3px solid var(--green)' : undefined, cursor: 'pointer' }}
      onClick={openPost}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') openPost() }}
    >

      {/* ═══════════════════════════════════════════════════════════
          MOBILE  (default, stacked):  Name → Title → Media → Caption → Footer
          DESKTOP (≥ 860px, 2 cols):  Left: Name + Title + Media + Footer  |  Right: Caption
      ═══════════════════════════════════════════════════════════ */}

      {/* ── Author ──────────────────────────────────── */}
      <div className="pc-author">
        <div className="pc-avatar">{post.authorName?.charAt(0)?.toUpperCase() || '?'}</div>
        <div className="pc-author-info">
          <span className="pc-name">{post.authorName}</span>
          <span className="pc-time">{timeAgo(post.createdAt)}</span>
        </div>
        <div className="pc-badges">
          {post.isPinned && <span className="badge badge-pinned" style={{ fontSize: 10 }}>📌 Pinned</span>}
          <span className={`badge ${cat.cls}`} style={{ fontSize: 10 }}>{cat.label}</span>
        </div>
      </div>

      {/* ── Title ──────────────────────────────────── */}
      <div className="pc-title">
        <h3>{post.title}</h3>
      </div>

      {/* ── Media ──────────────────────────────────── */}
      {preview && (
        <div className="pc-media" onClick={stopNav}>
          {preview.type === 'video' ? (
            <video
              src={preview.url}
              controls
              muted
              playsInline
              preload="metadata"
              className="pc-media-el"
            />
          ) : (
            <img
              src={preview.url}
              alt={post.title}
              loading="lazy"
              className="pc-media-el"
            />
          )}
          {post.media?.length > 1 && (
            <span className="pc-media-count">+{post.media.length - 1} more</span>
          )}
        </div>
      )}

      {/* ── Caption ─────────────────────────────────── */}
      {excerpt && <p className="pc-caption">{excerpt}</p>}

      {/* ── Footer ──────────────────────────────────── */}
      <div className="pc-footer" onClick={stopNav}>
        {/* Stats */}
        <div className="pc-stats">
          <span className="pc-stat"><MessageSquare size={13} />{post.commentCount || 0}</span>
          <span className="pc-stat"><Eye size={13} />{post.views || 0}</span>
        </div>

        {/* Actions */}
        <div className="pc-actions">
          {/* Like */}
          {isSignedIn ? (
            <button
              type="button"
              className={`pc-action-btn ${liked ? 'pc-action-liked' : ''}`}
              onClick={toggleLike}
              disabled={saving}
            >
              <ThumbsUp size={13} style={{ fill: liked ? 'var(--orange)' : 'none' }} />
              {likeCount}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="pc-action-btn" onClick={stopNav}>
                <ThumbsUp size={13} />{likeCount}
              </button>
            </SignInButton>
          )}

          {/* Delete — only for author or moderator */}
          {canDelete && (
            <button
              type="button"
              className="pc-action-btn pc-action-delete"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete post"
            >
              <Trash2 size={13} />
              {deleting ? '…' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
