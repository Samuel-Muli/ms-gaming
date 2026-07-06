import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { ThumbsUp, MessageSquare, Eye, Pin } from 'lucide-react'

const CAT_STYLES = {
  'pubg-strategy':  { label: 'PUBG Strategy',  cls: 'badge-pubg' },
  'pubg-clips':     { label: 'PUBG Clips',      cls: 'badge-pubg' },
  'hardware':       { label: 'Hardware',        cls: 'badge-laptop' },
  'card-exchange':  { label: 'Card Exchanges',  cls: 'badge-exchange' },
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
  const { isSignedIn, getToken } = useAuth()
  const cat = CAT_STYLES[post.category] || CAT_STYLES.general
  const preview = post.media?.[0]
  const caption = post.content?.replace(/[#*_`]/g, '').trim()
  const excerpt = caption ? `${caption.substring(0, 140)}${caption.length > 140 ? '…' : ''}` : ''

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [saving, setSaving] = useState(false)

  const toggleLike = async () => {
    if (!isSignedIn || saving) return
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`social-feed-card overflow-hidden transition-transform duration-200 group-hover:-translate-y-1 post-card-grid ${preview ? 'has-preview' : ''}`}
      style={{ borderLeft: post.isPinned ? '2px solid var(--green)' : undefined }}>

      <Link to={`/community/${post._id}`} className="post-card-link">
        <div className={`post-card-content px-4 py-4 ${preview ? 'has-preview' : ''}`}>
          <div className="post-card-meta post-card-meta-area">
            <div className="post-author">
              <div className="post-avatar">{post.authorName?.charAt(0)?.toUpperCase() || '?'}</div>
              <div className="min-w-0">
                <div className="post-author-name">{post.authorName}</div>
                <div className="post-meta">{timeAgo(post.createdAt)}</div>
              </div>
            </div>
            <div className="post-badge-group">
              {post.isPinned && <span className="badge badge-pinned">Pinned</span>}
              <span className={`badge ${cat.cls}`}>{cat.label}</span>
            </div>
          </div>

          {preview && (
            <div className="post-preview post-card-inline-preview post-preview-area">
              {preview.type === 'video' ? (
                <video
                  src={preview.url}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="post-preview-media"
                />
              ) : (
                <img src={preview.url} alt={post.title} loading="lazy" className="post-preview-media" />
              )}
              <div className="post-preview-overlay">
                <span>Community Drop</span>
              </div>
            </div>
          )}

          <div className="post-card-topline post-card-topline-area">
            <span className="post-card-label">Posted by</span>
            <span className="post-card-author-name">{post.authorName}</span>
          </div>

          <div className="post-card-text post-card-text-area">
            <h3 className="post-title">{post.title}</h3>
            {excerpt ? <p className="post-caption">{excerpt}</p> : null}
          </div>
        </div>
      </Link>

      <div className="post-card-footer px-4 pb-4">
        <div className="post-footer">
          <span className="post-footer-pill"><MessageSquare size={14} /> {post.commentCount || 0}</span>
          <span className="post-footer-pill"><Eye size={14} /> {post.views || 0}</span>
        </div>
        <div className="post-like-wrapper">
          {isSignedIn ? (
            <button
              type="button"
              className={`post-like-button post-footer-pill ${liked ? 'liked' : ''}`}
              onClick={toggleLike}
              disabled={saving}
            >
              <ThumbsUp size={14} /> {likeCount}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="post-like-button post-footer-pill">
                <ThumbsUp size={14} /> {likeCount}
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  )
}
