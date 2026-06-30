import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, Pin, Trash2, Send, CornerDownRight, X, ZoomIn } from 'lucide-react'
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

/* ── Lightbox ─────────────────────────────────────────────────────────────── */
function Lightbox({ src, type, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border)', color: '#fff', padding: '6px', cursor: 'pointer', zIndex: 10 }}>
        <X size={20} />
      </button>
      {type === 'image'
        ? <img src={src} alt="Full view" onClick={e => e.stopPropagation()} />
        : <video src={src} controls autoPlay onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }} />}
    </div>
  )
}

/* ── Media grid ───────────────────────────────────────────────────────────── */
function MediaGrid({ media }) {
  const [lightbox, setLightbox] = useState(null)
  if (!media?.length) return null
  return (
    <>
      <div className="post-media-grid mt-4">
        {media.map((m, i) => (
          <div key={i} className="post-media-item" onClick={() => setLightbox(m)}>
            {m.type === 'image'
              ? <img src={m.url} alt="" />
              : <video src={m.url} muted playsInline />}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
              <ZoomIn size={20} style={{ color: '#fff', opacity: 0, transition: 'opacity 0.2s' }}
                ref={el => {
                  if (el) {
                    el.parentElement.addEventListener('mouseenter', () => (el.style.opacity = '1'))
                    el.parentElement.addEventListener('mouseleave', () => (el.style.opacity = '0'))
                  }
                }} />
            </div>
          </div>
        ))}
      </div>
      {lightbox && <Lightbox src={lightbox.url} type={lightbox.type} onClose={() => setLightbox(null)} />}
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

  // Show floating back button after scrolling
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

      {/* ── Sticky back (top) ── */}
      <Link
        to="/community"
        className="flex items-center gap-2 mb-8 transition-colors"
        style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        <ArrowLeft size={14} /> Back to Community
      </Link>

      {/* ── Post body ── */}
      <article className="gaming-card p-6 md:p-8 mb-8">

        {/* Category / pin row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {post.isPinned && <span className="badge badge-pinned flex items-center gap-1"><Pin size={9} /> Pinned</span>}
          <span className={`badge ${cat.cls}`}>{cat.label}</span>
        </div>

        {/* Title */}
        <h1 className="font-barlow font-800 leading-tight mb-5"
          style={{ fontSize: 'clamp(22px, 4vw, 36px)', color: 'var(--text)' }}>
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Avatar name={post.authorName} />
          <div>
            <div className="font-barlow font-600" style={{ color: 'var(--gold)', fontSize: '16px' }}>{post.authorName}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>
              {timeAgo(post.createdAt)}
            </div>
          </div>

          {/* Mod controls */}
          {isModerator && (
            <div className="ml-auto flex items-center gap-2">
              <button onClick={pinPost} className={`btn text-xs px-3 py-1.5 ${post.isPinned ? 'btn-danger' : 'btn-ghost'}`}>
                <Pin size={11} /> {post.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={deletePost} className="btn btn-danger text-xs px-3 py-1.5">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="whitespace-pre-wrap leading-relaxed mb-5"
          style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)' }}>
          {post.content}
        </div>

        {/* Media */}
        <MediaGrid media={post.media} />

        {/* Reactions */}
        <div className="flex items-center gap-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={toggleLike}
            disabled={!isSignedIn}
            className="flex items-center gap-2 transition-all"
            style={{
              background: 'none', border: 'none',
              cursor: isSignedIn ? 'pointer' : 'default',
              color: liked ? 'var(--orange)' : 'var(--muted)',
              fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em',
            }}
          >
            <ThumbsUp size={16} style={{ fill: liked ? 'var(--orange)' : 'none' }} />
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>
          <span className="flex items-center gap-2"
            style={{ color: 'var(--muted)', fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}>
            <MessageSquare size={14} style={{ color: 'var(--gold)' }} />
            {comments.length} Comments
          </span>
          <span className="flex items-center gap-2"
            style={{ color: 'var(--muted)', fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}>
            <Eye size={14} /> {post.views || 0} Views
          </span>
        </div>
      </article>

      {/* ── Comments ── */}
      <section>
        <h2 className="font-barlow font-700 uppercase tracking-wider flex items-center gap-2 mb-5"
          style={{ fontSize: '20px', color: 'var(--text)' }}>
          <MessageSquare size={18} style={{ color: 'var(--orange)' }} />
          Comments ({comments.length})
        </h2>

        {/* Reply indicator */}
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

        {/* Comment form */}
        {isSignedIn ? (
          <div className="gaming-card p-5 mb-6">
            <div className="input-label mb-1">
              {replyTo ? `↩ Reply to ${replyTo.authorName}` : 'Add a Comment'}
            </div>
            <textarea
              ref={commentRef}
              className="input mt-1"
              rows={4}
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
          <div className="gaming-card p-5 mb-6 text-center">
            <p style={{ fontFamily: 'Rajdhani', color: 'var(--muted)', marginBottom: 12 }}>
              Sign in to join the discussion.
            </p>
          </div>
        )}

        {/* Comment list */}
        <div className="space-y-4">
          {topComments.length === 0 ? (
            <p className="text-center py-10" style={{ fontFamily: 'Rajdhani', color: 'var(--muted)' }}>
              No comments yet. Start the conversation!
            </p>
          ) : topComments.map(c => (
            <div key={c._id} className="gaming-card p-4">
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
                      className="flex items-center gap-1 mt-2 transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                      <CornerDownRight size={10} /> REPLY
                    </button>
                  )}
                </div>
              </div>

              {/* Nested replies */}
              {getReplies(c._id).map(r => (
                <div key={r._id} className="flex items-start gap-3 mt-3 pl-10"
                  style={{ borderLeft: '2px solid var(--border)', marginLeft: 16 }}>
                  <Avatar name={r.authorName} size={28} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-barlow font-600" style={{ fontSize: '13px', color: 'var(--gold)' }}>
                        {r.authorName}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>
                        {timeAgo(r.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}>
                      {r.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Floating back button (appears on scroll) ── */}
      {showBack && (
        <Link to="/community" className="float-back">
          <ArrowLeft size={14} /> Community
        </Link>
      )}
    </div>
  )
}
