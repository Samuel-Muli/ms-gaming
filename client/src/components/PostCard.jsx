import { useState, useRef, useEffect } from 'react'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { ThumbsUp, MessageSquare, Eye, Trash2, Send, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useRole } from '../hooks/useRole'

const CAT_STYLES = {
  'pubg-strategy':  { label: 'PUBG Strategy', cls: 'badge-pubg'    },
  'pubg-clips':     { label: 'PUBG Clips',    cls: 'badge-pubg'    },
  'hardware':       { label: 'Hardware',      cls: 'badge-laptop'  },
  'card-exchange':  { label: 'Card Exchanges',cls: 'badge-exchange'},
  'events':         { label: 'Events',        cls: 'badge-event'   },
  'general':        { label: 'General',       cls: 'badge-general' },
  'introductions':  { label: 'Introductions', cls: 'badge-phone'   },
}

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000
  if (s < 60)    return `${Math.floor(s)}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return new Date(d).toLocaleDateString()
}

/* ── Avatar ─────────────────────────────────────────────────────────────── */
function Avatar({ name, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, minWidth: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--orange), var(--gold))',
      color: '#0a0a0f', fontFamily: 'Orbitron,monospace', fontWeight: 900,
      fontSize: Math.round(size * 0.38), display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

/* ── Single comment ─────────────────────────────────────────────────────── */
function Comment({ comment, onDelete, canDelete, level = 0 }) {
  return (
    <div style={{
      display: 'flex', gap: 10, paddingLeft: level * 28,
      paddingTop: 10, paddingBottom: 10,
      borderBottom: '1px solid var(--border)',
    }}>
      <Avatar name={comment.authorName} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--gold)' }}>
            {comment.isDeleted ? (comment.deletedByName || 'Moderator') : comment.authorName}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)' }}>
            {timeAgo(comment.createdAt)}
          </span>
          {canDelete && !comment.isDeleted && (
            <button onClick={() => onDelete(comment._id)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontFamily: 'Barlow Condensed' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
        {comment.isDeleted ? (
          <p style={{ fontFamily: 'Rajdhani', fontSize: 14, color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>
            [Deleted by {comment.deletedByName || 'moderator'}]
          </p>
        ) : (
          <p style={{ fontFamily: 'Rajdhani', fontSize: 14, color: 'var(--muted)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {comment.content}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Inline comment section ─────────────────────────────────────────────── */
function CommentSection({ postId, initialCount = 0, isOpen, alreadyLoaded, cachedComments, onLoaded }) {
  const { isSignedIn, getToken, userId } = useAuth()
  const { isModerator, isLoaded } = useRole()
  const [comments, setComments]     = useState(cachedComments || [])
  const [loading, setLoading]       = useState(false)
  const [text, setText]             = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo]       = useState(null)
  const bottomRef                   = useRef(null)
  const inputRef                    = useRef(null)

  // Fetch on first open
  useEffect(() => {
    if (!isOpen || alreadyLoaded) return
    setLoading(true)
    fetch(`/api/posts/${postId}/comments`)
      .then(r => r.json())
      .then(data => {
        const list = data.comments || data || []
        setComments(list)
        onLoaded(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, postId, alreadyLoaded])

  const submit = async () => {
    if (!text.trim() && !replyTo) return
    setSubmitting(true)
    try {
      const token = await getToken()
      const body = { content: text.trim() }
      if (replyTo) body.parentId = replyTo.id
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const c = await res.json()
        setComments(p => [...p, c])
        onLoaded(null, [...comments, c])
        setText('')
        setReplyTo(null)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      }
    } catch {}
    finally { setSubmitting(false) }
  }

  const deleteComment = async (cId) => {
    const token = await getToken()
    const res = await fetch(`/api/comments/${cId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      setComments(p => p.map(c =>
        String(c._id) === String(cId)
          ? { ...c, isDeleted: true, deletedByName: 'You' }
          : c
      ))
    }
  }

  const focusReply = (c) => {
    setReplyTo({ id: c._id, name: c.authorName })
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  const topLevel = comments.filter(c => !c.parentId)
  const getReplies = (id) => comments.filter(c => String(c.parentId) === String(id))

  return (
    <div className="pc-comment-section">
      {/* Scrollable comment list */}
      <div className="pc-comment-list">
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'Rajdhani', fontSize: 14, padding: '12px 0' }}>
            Loading comments…
          </p>
        )}
        {!loading && topLevel.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'Rajdhani', fontSize: 14, padding: '12px 0' }}>
            No comments yet. Be first!
          </p>
        )}
        {topLevel.map(c => (
          <div key={String(c._id)}>
            <Comment
              comment={c}
              canDelete={isLoaded && (isModerator || (isSignedIn && userId === c.authorId))}
              onDelete={deleteComment}
            />
            {getReplies(c._id).map(r => (
              <Comment key={String(r._id)} comment={r} level={1}
                canDelete={isLoaded && (isModerator || (isSignedIn && userId === r.authorId))}
                onDelete={deleteComment}
              />
            ))}
            {/* Reply button */}
            {isSignedIn && !c.isDeleted && (
              <button onClick={() => focusReply(c)}
                style={{ marginLeft: 40, marginBottom: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 11, fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 3 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--orange)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                <CornerDownRight size={10} /> REPLY
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Comment input */}
      <div className="pc-comment-input-wrap">
        {replyTo && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', fontFamily: 'Barlow Condensed' }}>
            <span>↩ Replying to <span style={{ color: 'var(--gold)' }}>{replyTo.name}</span></span>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>✕</button>
          </div>
        )}
        {isSignedIn ? (
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
              placeholder={replyTo ? `Reply to ${replyTo.name}…` : 'Write a comment… (Enter to post)'}
              style={{
                flex: 1, resize: 'none', minHeight: 36, maxHeight: 120, padding: '6px 10px',
                background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)',
                fontFamily: 'Rajdhani', fontSize: 14, outline: 'none', lineHeight: 1.5,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={submit} disabled={submitting || !text.trim()}
              style={{
                background: text.trim() ? 'linear-gradient(135deg,var(--orange),var(--gold))' : 'var(--s2)',
                border: 'none', color: text.trim() ? '#0a0a0f' : 'var(--muted)',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s',
              }}>
              <Send size={15} />
            </button>
          </div>
        ) : (
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <SignInButton mode="modal">
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 14px' }}>
                Sign in to comment
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main PostCard ───────────────────────────────────────────────────────── */
export default function PostCard({ post, onDelete }) {
  const { isSignedIn, getToken, userId } = useAuth()
  const { isModerator } = useRole()

  const [liked,          setLiked]          = useState(false)
  const [likeCount,      setLikeCount]      = useState(post.likes?.length || 0)
  const [saving,         setSaving]         = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [commentsOpen,   setCommentsOpen]   = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [cachedComments, setCachedComments] = useState([])
  const [commentCount,   setCommentCount]   = useState(post.commentCount || 0)

  const cat     = CAT_STYLES[post.category] || CAT_STYLES.general
  const preview = post.media?.[0]
  const rawText = post.content?.replace(/[#*_`]/g, '').trim() || ''

  const isAuthor = isSignedIn && userId === post.authorId
  const canDelete = isAuthor || isModerator
  const stop = (e) => e.stopPropagation()

  const toggleLike = async (e) => {
    stop(e); if (!isSignedIn || saving) return
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/posts/${String(post._id)}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); setLiked(d.liked); setLikeCount(d.likeCount) }
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (e) => {
    stop(e)
    if (!window.confirm('Delete this post?')) return
    setDeleting(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/posts/${String(post._id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok && onDelete) onDelete(post._id)
    } catch {} finally { setDeleting(false) }
  }

  const toggleComments = (e) => { stop(e); setCommentsOpen(o => !o) }

  const handleCommentLoaded = (list, updatedList) => {
    if (list !== null) { setCachedComments(list); setCommentsLoaded(true) }
    if (updatedList)   { setCachedComments(updatedList); setCommentCount(updatedList.length) }
  }

  return (
    <div className="pc-card social-feed-card" style={{ borderLeft: post.isPinned ? '3px solid var(--green)' : undefined }}>

      {/* ════════════════════════════════════════════════════════════
          Mobile: stack → Author, Title, Media, Caption, Comments, Footer
          Desktop ≥860px: 2 columns
            Left:  Author | Title | Media | Footer
            Right: Caption | CommentSection (scrollable)
      ════════════════════════════════════════════════════════════ */}

      {/* ── Author ── */}
      <div className="pc-author">
        <Avatar name={post.authorName} />
        <div className="pc-author-info">
          <span className="pc-name">{post.authorName}</span>
          <span className="pc-time">{timeAgo(post.createdAt)}</span>
        </div>
        <div className="pc-badges">
          {post.isPinned && <span className="badge badge-pinned" style={{ fontSize: 10 }}>📌 Pinned</span>}
          <span className={`badge ${cat.cls}`} style={{ fontSize: 10 }}>{cat.label}</span>
        </div>
      </div>

      {/* ── Title ── */}
      {post.title && (
        <div className="pc-title">
          <h3>{post.title}</h3>
        </div>
      )}

      {/* ── Media ── */}
      {preview && (
        <div className="pc-media" onClick={stop}>
          {preview.type === 'video' ? (
            <video src={preview.url} controls muted playsInline preload="metadata" className="pc-media-el" />
          ) : (
            <img src={preview.url} alt={post.title || 'post'} loading="lazy" className="pc-media-el" />
          )}
          {post.media?.length > 1 && <span className="pc-media-count">+{post.media.length - 1} more</span>}
        </div>
      )}

      {/* ── RIGHT PANEL (caption + comments on desktop) ── */}
      <div className="pc-right-panel">

        {/* Caption */}
        {rawText && <p className="pc-caption">{rawText}</p>}

        {/* Comment section — visible inline on desktop when opened; on mobile foldable */}
        <div className="pc-comments-region" onClick={stop}>
          {/* Toggle button (mobile: always shown; desktop: shown when closed) */}
          <button className="pc-comment-toggle" onClick={toggleComments}>
            <MessageSquare size={14} />
            <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
            {commentsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <CommentSection
            postId={String(post._id)}
            initialCount={commentCount}
            isOpen={commentsOpen}
            alreadyLoaded={commentsLoaded}
            cachedComments={cachedComments}
            onLoaded={handleCommentLoaded}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pc-footer" onClick={stop}>
        <div className="pc-stats">
          <span className="pc-stat"><Eye size={13} />{post.views || 0}</span>
        </div>
        <div className="pc-actions">
          {/* Like */}
          {isSignedIn ? (
            <button type="button" className={`pc-action-btn ${liked ? 'pc-action-liked' : ''}`} onClick={toggleLike} disabled={saving}>
              <ThumbsUp size={13} style={{ fill: liked ? 'var(--orange)' : 'none' }} />
              {likeCount}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="pc-action-btn" onClick={stop}>
                <ThumbsUp size={13} />{likeCount}
              </button>
            </SignInButton>
          )}
          {/* Delete */}
          {canDelete && (
            <button type="button" className="pc-action-btn pc-action-delete" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={13} />{deleting ? '…' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
