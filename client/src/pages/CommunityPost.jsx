import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, Pin, Trash2, Send, CornerDownRight, X, ZoomIn, Play } from 'lucide-react'
import { useRole } from '../hooks/useRole'
import { PageLoader } from '../components/Loader'

const CAT_STYLES = {
  'pubg-strategy':  { label: '⚔️ PUBG Strategy', cls: 'badge-pubg' },
  'pubg-clips':     { label: '🎥 PUBG Clips',     cls: 'badge-pubg' },
  'hardware':       { label: '🖥️ Hardware',        cls: 'badge-laptop' },
  'events':         { label: '🏆 Events',          cls: 'badge-event' },
  'general':        { label: '💬 General',         cls: 'badge-general' },
  'introductions':  { label: '👋 Introductions',   cls: 'badge-phone' },
}

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000
  if (s < 60)    return `${Math.floor(s)}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return new Date(d).toLocaleDateString()
}

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'linear-gradient(135deg, var(--s2), var(--border))',
      border: '1px solid var(--border)', color: 'var(--gold)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Orbitron', fontWeight: 700, fontSize: size * 0.35,
    }}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

/* ── Smooth Lightbox ──────────────────────────────────────────────────────── */
function Lightbox({ src, type, onClose }) {
  const [loaded, setLoaded] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    // Lock body scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 280)
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        animation: closing ? 'lbOut 0.28s ease forwards' : 'lbIn 0.25s ease',
        cursor: 'zoom-out',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 2,
          background: 'rgba(10,10,15,0.85)', border: '1px solid var(--border)',
          color: 'var(--text)', width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', borderRadius: 0,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,10,15,0.85)'; e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <X size={18} />
      </button>

      {/* ESC hint */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.1em', pointerEvents: 'none',
      }}>
        ESC to close
      </div>

      {/* Loading spinner */}
      {!loaded && (
        <div style={{ position: 'absolute', color: 'var(--orange)' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid rgba(240,132,44,0.2)',
            borderTopColor: 'var(--orange)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* Media */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '92vw', maxHeight: '88vh',
          animation: closing ? 'mediaOut 0.28s ease forwards' : 'mediaIn 0.3s cubic-bezier(0.175,0.885,0.32,1.2)',
          cursor: 'default',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      >
        {type === 'image' ? (
          <img
            src={src}
            alt="Full view"
            onLoad={() => setLoaded(true)}
            style={{
              display: 'block',
              maxWidth: '92vw', maxHeight: '88vh',
              objectFit: 'contain',
              boxShadow: '0 0 60px rgba(0,0,0,0.8)',
              border: '1px solid rgba(240,132,44,0.2)',
            }}
          />
        ) : (
          <video
            src={src}
            controls
            autoPlay
            onLoadedData={() => setLoaded(true)}
            style={{
              display: 'block',
              maxWidth: '92vw', maxHeight: '88vh',
              boxShadow: '0 0 60px rgba(0,0,0,0.8)',
              border: '1px solid rgba(240,132,44,0.2)',
              background: '#000',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes lbIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes lbOut   { from { opacity:1 } to { opacity:0 } }
        @keyframes mediaIn { from { opacity:0; transform:scale(0.88) } to { opacity:1; transform:scale(1) } }
        @keyframes mediaOut{ from { opacity:1; transform:scale(1)    } to { opacity:0; transform:scale(0.92) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

/* ── Single media thumb ───────────────────────────────────────────────────── */
function MediaThumb({ item, onClick }) {
  const [hovering, setHovering] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div
      className="post-media-item"
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ cursor: 'zoom-in' }}
    >
      {/* Loading placeholder */}
      {!imgLoaded && item.type === 'image' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--s2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 24, height: 24, border: '2px solid rgba(240,132,44,0.2)',
            borderTopColor: 'var(--orange)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {item.type === 'image' ? (
        <img
          src={item.url}
          alt=""
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transition: 'transform 0.3s ease',
            transform: hovering ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      ) : (
        <video
          src={item.url}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovering ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
        transition: 'background 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.type === 'video' ? (
          <Play size={28} style={{
            color: '#fff', opacity: hovering ? 1 : 0.4,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
            transition: 'opacity 0.2s',
            fill: 'rgba(255,255,255,0.9)',
          }} />
        ) : (
          <ZoomIn size={22} style={{
            color: '#fff', opacity: hovering ? 1 : 0,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
            transition: 'opacity 0.2s',
          }} />
        )}
      </div>

      {/* Video badge */}
      {item.type === 'video' && (
        <div style={{
          position: 'absolute', bottom: 6, left: 6,
          background: 'rgba(0,0,0,0.75)', color: '#fff',
          fontFamily: 'Barlow Condensed', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.08em', padding: '2px 6px',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Play size={8} fill="currentColor" /> VIDEO
        </div>
      )}
    </div>
  )
}

/* ── Media grid — image top, text bottom layout ───────────────────────────── */
function MediaGrid({ media }) {
  const [lightbox, setLightbox] = useState(null)
  if (!media?.length) return null

  const count = media.length

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: count === 1 ? '1fr' : count === 2 ? '1fr 1fr' : count === 3 ? '1fr 1fr 1fr' : 'repeat(2, 1fr)',
          gap: 8,
          marginTop: 16,
          marginBottom: 4,
        }}
      >
        {media.map((m, i) => (
          <MediaThumb key={i} item={m} onClick={() => setLightbox(m)} />
        ))}
      </div>
      {count > 1 && (
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)', marginTop: 4 }}>
          {count} attachment{count > 1 ? 's' : ''} · click to expand
        </p>
      )}
      {lightbox && <Lightbox src={lightbox.url} type={lightbox.type} onClose={() => setLightbox(null)} />}
    </>
  )
}

/* ── Post body: text + media side-by-side on desktop ─────────────────────── */
function PostBody({ content, media }) {
  const hasMedia = media?.length > 0
  const caption = content?.trim()

  if (!hasMedia) {
    return (
      <div className="whitespace-pre-wrap leading-relaxed mb-5"
        style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)' }}>
        {content}
      </div>
    )
  }

  return (
    <>
      <MediaGrid media={media} />
      {caption && (
        <div className="whitespace-pre-wrap leading-relaxed mt-5 mb-2"
          style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)' }}>
          {content}
        </div>
      )}
    </>
  )
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function CommunityPost() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { isSignedIn, getToken } = useAuth()
  const { isModerator } = useRole()

  const [post, setPost]         = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo]   = useState(null)
  const [showBack, setShowBack] = useState(false)
  const commentRef              = useRef()

  useEffect(() => {
    const handler = () => setShowBack(window.scrollY > 180)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setPost(data)
          setLiked(data.likedByMe || false)
          setLikeCount(data.likes?.length || 0)
          setComments(data.comments || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const toggleLike = async () => {
    if (!isSignedIn) return
    const token = await getToken()
    const res = await fetch(`/api/posts/${id}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setLiked(data.liked)
    setLikeCount(data.likeCount)
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const token = await getToken()
      const body = { content: newComment.trim() }
      if (replyTo) body.parentId = replyTo.id
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const comment = await res.json()
      setComments(prev => [...prev, comment])
      setNewComment('')
      setReplyTo(null)
    } catch {}
    finally { setSubmitting(false) }
  }

  const deletePost = async () => {
    if (!confirm('Permanently delete this post?')) return
    const token = await getToken()
    await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    navigate('/community')
  }

  const pinPost = async () => {
    const token = await getToken()
    const res = await fetch(`/api/posts/${id}/pin`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setPost(p => ({ ...p, isPinned: data.isPinned }))
  }

  const deleteComment = async (cId) => {
    const token = await getToken()
    await fetch(`/api/comments/${cId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setComments(prev => prev.filter(c => c._id !== cId))
  }

  const focusReply = (authorName, cId) => {
    setReplyTo({ id: cId, authorName })
    commentRef.current?.focus()
    commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (loading) return <PageLoader label="Loading post…" />

  if (!post) return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <p className="font-orbitron" style={{ color: 'var(--muted)' }}>Post not found.</p>
      <Link to="/community" className="btn btn-ghost">← Back to Community</Link>
    </div>
  )

  const cat = CAT_STYLES[post.category] || CAT_STYLES.general
  const topComments = comments.filter(c => !c.parentId)
  const getReplies  = (cId) => comments.filter(c => c.parentId === cId)

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">

      {/* Back */}
      <Link
        to="/community"
        className="flex items-center gap-2 mb-8 transition-colors"
        style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        <ArrowLeft size={14} /> Back to Community
      </Link>

      {/* Post */}
      <article className="social-post-card p-6 md:p-8 mb-8">
        <div className="social-post-header mb-6">
          <div>
            <div className="social-post-badge-row">
              {post.isPinned && <span className="social-pill">Pinned</span>}
              <span className={`badge ${cat.cls}`}>{cat.label}</span>
            </div>
            <h1 className="font-barlow font-800 leading-tight mt-3"
              style={{ fontSize: 'clamp(24px, 4vw, 38px)', color: 'var(--text)' }}>
              {post.title}
            </h1>
          </div>
          <div className="social-post-author-card">
            <Avatar name={post.authorName} />
            <div>
              <div className="font-barlow font-600" style={{ color: 'var(--gold)', fontSize: '16px' }}>{post.authorName}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>
                {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="social-post-grid">
          <div>
            <PostBody content={post.content} media={post.media} />

            <div className="social-post-actions">
              <button onClick={toggleLike} disabled={!isSignedIn}
                className="social-action-button"
                style={{ cursor: isSignedIn ? 'pointer' : 'default' }}>
                <ThumbsUp size={16} style={{ fill: liked ? 'var(--orange)' : 'none' }} />
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </button>
              <span className="social-action-pill">
                <MessageSquare size={14} style={{ color: 'var(--gold)' }} />
                {comments.length} Comments
              </span>
              <span className="social-action-pill">
                <Eye size={14} /> {post.views || 0} Views
              </span>
            </div>
          </div>

          <aside className="social-post-sidebar">
            <div className="sidebar-card sidebar-info-card">
              <div className="sidebar-title">GAME ROOM</div>
              <div className="sidebar-metrics">
                <div className="sidebar-metric-item">
                  <strong>{likeCount}</strong>
                  <span>Likes</span>
                </div>
                <div className="sidebar-metric-item">
                  <strong>{comments.length}</strong>
                  <span>Comments</span>
                </div>
                <div className="sidebar-metric-item">
                  <strong>{post.views || 0}</strong>
                  <span>Views</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card sidebar-info-card">
              <div className="sidebar-title">About this post</div>
              <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                A premium community drop with gaming tips, media and player strategy.
              </p>
            </div>

            {isModerator && (
              <div className="sidebar-card">
                <button onClick={pinPost} className="btn btn-ghost btn-sm mb-3">
                  <Pin size={12} /> {post.isPinned ? 'Unpin Post' : 'Pin Post'}
                </button>
                <button onClick={deletePost} className="btn btn-danger btn-sm w-full">
                  <Trash2 size={12} /> Delete Post
                </button>
              </div>
            )}
          </aside>
        </div>
      </article>

      {/* Comments */}
      <section>
        <h2 className="font-barlow font-700 uppercase tracking-wider flex items-center gap-2 mb-5"
          style={{ fontSize: '20px', color: 'var(--text)' }}>
          <MessageSquare size={18} style={{ color: 'var(--orange)' }} />
          Comments ({comments.length})
        </h2>

        {replyTo && (
          <div className="flex items-center justify-between px-4 py-2 mb-3"
            style={{ background: 'var(--s2)', border: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}>
              Replying to <span style={{ color: 'var(--gold)' }}>{replyTo.authorName}</span>
            </span>
            <button onClick={() => setReplyTo(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {isSignedIn ? (
          <div className="gaming-card p-5 mb-6 social-comment-input">
            <div className="input-label mb-1">
              {replyTo ? `↩ Reply to ${replyTo.authorName}` : 'Add a Comment'}
            </div>
            <textarea
              ref={commentRef}
              className="input mt-1" rows={4}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts…"
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submitComment() }}
            />
            <div className="flex items-center justify-between mt-3">
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>Ctrl+Enter to post</span>
              <button className="btn btn-primary" onClick={submitComment} disabled={submitting || !newComment.trim()}>
                <Send size={14} /> {submitting ? 'Posting…' : replyTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="gaming-card p-5 mb-6 text-center social-comment-input">
            <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)', marginBottom: 12 }}>
              Sign in to join the discussion.
            </p>
            <SignInButton mode="modal">
              <button type="button" className="btn btn-ghost text-sm">Sign In to Comment</button>
            </SignInButton>
          </div>
        )}

        <div className="space-y-4">
          {topComments.length === 0 ? (
            <p className="text-center py-10" style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
              No comments yet. Start the conversation!
            </p>
          ) : topComments.map(c => (
            <div key={c._id} className="gaming-card p-4 comment-card">
              <div className="flex items-start gap-3">
                <Avatar name={c.authorName} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-barlow font-600 text-sm" style={{ color: 'var(--gold)' }}>{c.authorName}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>
                        {timeAgo(c.createdAt)}
                      </span>
                      {isModerator && (
                        <button onClick={() => deleteComment(c._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Rajdhani', fontSize: '15px', color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </p>
                  {isSignedIn && (
                    <button
                      onClick={() => focusReply(c.authorName, c._id)}
                      className="flex items-center gap-1 mt-2"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                      <CornerDownRight size={10} /> REPLY
                    </button>
                  )}
                </div>
              </div>

              {getReplies(c._id).map(r => (
                <div key={r._id} className="flex items-start gap-3 mt-3 pl-10 reply-card">
                  <Avatar name={r.authorName} size={28} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-barlow font-600" style={{ fontSize: '13px', color: 'var(--gold)' }}>{r.authorName}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>
                        {timeAgo(r.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}>{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {showBack && (
        <Link to="/community" className="float-back">
          <ArrowLeft size={14} /> Community
        </Link>
      )}
    </div>
  )
}
