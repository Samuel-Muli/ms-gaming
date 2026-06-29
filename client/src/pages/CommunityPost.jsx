import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, Pin, Trash2, Send, Flag } from 'lucide-react'
import { useRole } from '../hooks/useRole'

const CAT_STYLES = {
  'pubg-strategy':  { label: '⚔️ PUBG Strategy', cls: 'badge-pubg' },
  'pubg-clips':     { label: '🎥 PUBG Clips',     cls: 'badge-pubg' },
  'hardware':       { label: '🖥️ Hardware',       cls: 'badge-laptop' },
  'events':         { label: '🏆 Events',         cls: 'badge-event' },
  'general':        { label: '💬 General',        cls: 'badge-general' },
  'introductions':  { label: '👋 Introductions',  cls: 'badge-phone' },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return `${Math.floor(diff)}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function Avatar({ name, size = 10 }) {
  return (
    <div
      className={`w-${size} h-${size} shrink-0 flex items-center justify-center font-orbitron font-700 text-xs`}
      style={{ background: 'linear-gradient(135deg, #1c1c28, #2a2a3a)', border: '1px solid #2a2a3a', color: '#C8A044', width: size * 4, height: size * 4 }}
    >
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

export default function CommunityPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSignedIn, getToken, userId } = useAuth()
  const { isModerator } = useRole()

  const [post, setPost]       = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState(null) // { id, authorName }

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setPost(data)
      setLiked(data.likedByMe || false)
      setLikeCount(data.likes?.length || 0)
      setComments(data.comments || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPost() }, [id])

  const toggleLike = async () => {
    if (!isSignedIn) return
    const token = await getToken()
    const res = await fetch(`/api/posts/${id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
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
    if (!confirm('Delete this post?')) return
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <MessageSquare size={32} className="text-g-orange animate-pulse" />
    </div>
  )

  if (!post) return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <p className="font-orbitron text-g-muted">Post not found.</p>
      <Link to="/community" className="btn btn-ghost">← Back to Community</Link>
    </div>
  )

  const cat = CAT_STYLES[post.category] || CAT_STYLES.general
  const topComments  = comments.filter(c => !c.parentId)
  const getReplies   = (cId) => comments.filter(c => c.parentId === cId)

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">

      {/* Back */}
      <Link
        to="/community"
        className="flex items-center gap-2 text-g-muted hover:text-g-orange transition-colors mb-8"
        style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}
      >
        <ArrowLeft size={14} /> Back to Community
      </Link>

      {/* Post */}
      <article className="gaming-card p-6 md:p-8 mb-8">

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.isPinned && <span className="badge badge-pinned flex items-center gap-1"><Pin size={9} /> Pinned</span>}
          <span className={`badge ${cat.cls}`}>{cat.label}</span>
        </div>

        {/* Title */}
        <h1 className="font-barlow font-800 text-2xl md:text-3xl text-g-text leading-tight mb-5">
          {post.title}
        </h1>

        {/* Author + time */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-g-border">
          <Avatar name={post.authorName} />
          <div>
            <div className="font-barlow font-600 text-g-gold text-base">{post.authorName}</div>
            <div className="text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              {timeAgo(post.createdAt)}
              {post.updatedAt && post.updatedAt !== post.createdAt && ' · edited'}
            </div>
          </div>

          {/* Mod actions */}
          {isModerator && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={pinPost}
                className={`btn text-xs px-3 py-1.5 ${post.isPinned ? 'btn-danger' : 'btn-ghost'}`}
              >
                <Pin size={11} /> {post.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={deletePost} className="btn btn-danger text-xs px-3 py-1.5">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="text-g-muted leading-relaxed mb-6 whitespace-pre-wrap"
          style={{ fontFamily: 'Rajdhani', fontSize: '16px' }}
        >
          {post.content}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-4 pt-4 border-t border-g-border">
          <button
            onClick={toggleLike}
            disabled={!isSignedIn}
            className="flex items-center gap-2 transition-all"
            style={{
              color: liked ? '#F0842C' : '#8888AA',
              fontFamily: 'Barlow Condensed',
              fontSize: '13px',
              letterSpacing: '0.06em',
              background: 'none',
              border: 'none',
              cursor: isSignedIn ? 'pointer' : 'default',
            }}
          >
            <ThumbsUp size={16} style={{ fill: liked ? '#F0842C' : 'none' }} />
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>
          <span className="flex items-center gap-2 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}>
            <MessageSquare size={15} className="text-g-gold" />
            {comments.length} Comments
          </span>
          <span className="flex items-center gap-2 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}>
            <Eye size={15} /> {post.views || 0} Views
          </span>
        </div>
      </article>

      {/* Comments section */}
      <section>
        <h2 className="font-barlow font-700 text-xl uppercase tracking-wider text-g-text mb-5 flex items-center gap-2">
          <MessageSquare size={18} className="text-g-orange" />
          Comments ({comments.length})
        </h2>

        {/* Reply indicator */}
        {replyTo && (
          <div className="flex items-center justify-between bg-g-surface2 border border-g-border px-4 py-2 mb-3 text-sm">
            <span className="text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
              Replying to <span className="text-g-gold">{replyTo.authorName}</span>
            </span>
            <button onClick={() => setReplyTo(null)} className="text-g-muted hover:text-g-text"><X size={14} /></button>
          </div>
        )}

        {/* Comment form */}
        {isSignedIn ? (
          <div className="gaming-card p-5 mb-6">
            <label className="input-label">
              {replyTo ? `Reply to ${replyTo.authorName}` : 'Add a Comment'}
            </label>
            <textarea
              className="input mt-1"
              rows={4}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts…"
            />
            <div className="flex justify-end mt-3">
              <button className="btn btn-primary" onClick={submitComment} disabled={submitting || !newComment.trim()}>
                <Send size={14} />
                {submitting ? 'Posting…' : replyTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="gaming-card p-5 mb-6 text-center">
            <p className="text-g-muted mb-3" style={{ fontFamily: 'Rajdhani' }}>
              Sign in to join the discussion.
            </p>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-4">
          {topComments.length === 0 ? (
            <p className="text-g-muted text-center py-10" style={{ fontFamily: 'Rajdhani' }}>
              No comments yet. Start the conversation!
            </p>
          ) : (
            topComments.map(c => (
              <div key={c._id} className="gaming-card p-4">
                {/* Comment header */}
                <div className="flex items-start gap-3">
                  <Avatar name={c.authorName} size={9} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-barlow font-600 text-g-gold text-sm">{c.authorName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }}>{timeAgo(c.createdAt)}</span>
                        {(isModerator) && (
                          <button onClick={() => deleteComment(c._id)} className="text-g-muted hover:text-g-red transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-g-muted leading-relaxed" style={{ fontFamily: 'Rajdhani', fontSize: '15px' }}>
                      {c.content}
                    </p>
                    {isSignedIn && (
                      <button
                        onClick={() => setReplyTo({ id: c._id, authorName: c.authorName })}
                        className="text-g-muted hover:text-g-orange transition-colors mt-2 flex items-center gap-1"
                        style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.06em', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Flag size={10} /> REPLY
                      </button>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {getReplies(c._id).map(r => (
                  <div key={r._id} className="flex items-start gap-3 mt-3 pl-10 border-l border-g-border ml-4">
                    <Avatar name={r.authorName} size={8} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-barlow font-600 text-g-gold" style={{ fontSize: '13px' }}>{r.authorName}</span>
                        <span className="text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }}>{timeAgo(r.createdAt)}</span>
                      </div>
                      <p className="text-g-muted" style={{ fontFamily: 'Rajdhani', fontSize: '14px' }}>{r.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
