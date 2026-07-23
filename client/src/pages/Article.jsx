import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { Helmet } from 'react-helmet-async'
import { Clock, Tag, MessageSquare, Send, Trash2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STATUS_COLORS } from '../data/events'
import { useContentBySlug } from '../lib/content'
import { useRole } from '../hooks/useRole'

function getBackPath(category) {
  if (category === 'phone')  return { path: '/gaming-phones', label: 'Gaming Phones' }
  if (category === 'laptop') return { path: '/laptops-consoles', label: 'Laptops & Consoles' }
  if (category === 'event')  return { path: '/upcoming-games', label: 'Games & Events' }
  return { path: '/', label: 'Home' }
}

function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading':
      return block.level === 2
        ? <h2>{block.text}</h2>
        : <h3>{block.text}</h3>
    case 'paragraph':
      return <p>{block.text}</p>
    case 'list':
      return <ul>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    case 'tip':
      return <div className="tip">{block.text}</div>
    case 'warning':
      return <div className="warning">{block.text}</div>
    default:
      return null
  }
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Article({ category }) {
  const { slug } = useParams()
  const { item: article, loading } = useContentBySlug(slug)
  const back = getBackPath(category)

  const { getToken, isSignedIn } = useAuth()
  const { isModerator } = useRole()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    fetch(`/api/articles/${slug}/comments`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setComments(data))
      .catch(() => {})
  }, [slug])

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      const comment = await res.json()
      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteComment = async (id) => {
    try {
      const token = await getToken()
      await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setComments(prev => prev.filter(c => c._id !== id))
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="font-orbitron text-g-muted text-xl">Loading…</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <Helmet><title>Article Not Found | M S Gaming</title></Helmet>
        <p className="font-orbitron text-g-muted text-xl">Article not found</p>
        <Link to={back.path} className="btn btn-ghost">← Back to {back.label}</Link>
      </div>
    )
  }

  const eventStatus = article.status ? STATUS_COLORS[article.status] : null

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">
      <Helmet>
        <title>{article.title} | M S Gaming</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        {article.thumbUrl && <meta property="og:image" content={article.thumbUrl} />}
        <meta name="twitter:card" content={article.thumbUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
      </Helmet>

      {/* Back */}
      <Link
        to={back.path}
        className="flex items-center gap-2 text-g-muted hover:text-g-orange transition-colors mb-8"
        style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}
      >
        <ArrowLeft size={14} /> Back to {back.label}
      </Link>

      {/* Header */}
      <header className="mb-10">
        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {eventStatus && <span className={`badge ${eventStatus.cls}`}>{eventStatus.label}</span>}
          {article.tags?.map(t => (
            <span key={t} className="flex items-center gap-1 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.08em' }}>
              <Tag size={9} className="text-g-orange" /> {t.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1
          className="font-barlow font-800 text-g-text leading-tight mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
        >
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-g-muted mb-6" style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.04em' }}>
          <span className="text-g-gold font-semibold">{article.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {article.readTime} MIN READ
          </span>
          <span>·</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}>{article.publishedAt}</span>
          {article.date && <span className="text-g-green">📅 {article.date}</span>}
          {article.location && <span>📍 {article.location}</span>}
          {article.prizePool && <span className="text-g-gold font-semibold">💰 {article.prizePool}</span>}
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, var(--orange), rgba(240,132,44,0.1), transparent)' }} />
      </header>

      {/* Hero image — shown when thumbUrl is set */}
      {article.thumbUrl && (
        <div
          className="mb-8 overflow-hidden"
          style={{ border: '1px solid var(--border)', position: 'relative', maxHeight: 420 }}
        >
          <img
            src={article.thumbUrl}
            alt={article.title}
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 55%, rgba(10,10,15,0.65) 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge badge-pubg">{(article.category || 'pubg').toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Two-column layout (article + mini sidebar) */}
      <div className="flex gap-8">

        {/* Article body */}
        <article className="flex-1 min-w-0 prose-gaming">
          {article.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </article>

        {/* Mini sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-4">
            {/* Author card */}
            <div className="gaming-card p-4">
              <div className="section-label mb-3">Author</div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center font-orbitron font-700 text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--s2), var(--border))', border: '1px solid rgba(240,132,44,0.3)', color: 'var(--gold)' }}
                >
                  M
                </div>
                <div>
                  <div className="font-barlow font-600 text-g-gold text-base">【M。S】</div>
                  <div className="text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.1em' }}>FOUNDER</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {article.tags && (
              <div className="gaming-card p-4">
                <div className="section-label mb-3">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(t => (
                    <span key={t} className="badge badge-general">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments count */}
            <div className="gaming-card p-4">
              <div className="flex items-center gap-2 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}>
                <MessageSquare size={14} className="text-g-orange" />
                {comments.length} COMMENT{comments.length !== 1 ? 'S' : ''}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Comments ── */}
      <section className="mt-12">
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--orange), rgba(240,132,44,0.1), transparent)' }} />
        <h2 className="font-barlow font-700 text-xl uppercase tracking-wider text-g-text mb-6 flex items-center gap-2">
          <MessageSquare size={18} className="text-g-orange" />
          Comments ({comments.length})
        </h2>

        {/* Comment form */}
        {isSignedIn ? (
          <div className="gaming-card p-5 mb-6">
            <label className="input-label">Your Comment</label>
            <textarea
              className="input mt-1"
              rows={4}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this article…"
            />
            {error && <p className="text-g-red text-sm mt-2">{error}</p>}
            <div className="mt-3 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
              >
                <Send size={14} />
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="gaming-card p-5 mb-6 text-center">
            <p className="text-g-muted mb-3" style={{ fontFamily: 'Rajdhani' }}>Sign in to leave a comment.</p>
            <SignInButton mode="modal">
              <button className="btn btn-ghost text-sm">Sign In to Comment</button>
            </SignInButton>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-g-muted text-center py-8" style={{ fontFamily: 'Rajdhani' }}>
              No comments yet. Be the first to comment!
            </p>
          )}
          {comments.map(c => (
            <div key={c._id} className="gaming-card p-4 flex gap-3">
              <div
                className="w-9 h-9 shrink-0 flex items-center justify-center font-orbitron text-xs font-700"
                style={{ background: 'linear-gradient(135deg, var(--s2), var(--border))', border: '1px solid var(--border)', color: 'var(--gold)' }}
              >
                {c.authorName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-barlow font-600 text-g-gold text-sm">{c.authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-g-muted" style={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }}>{timeAgo(c.createdAt)}</span>
                    {isModerator && (
                      <button onClick={() => deleteComment(c._id)} className="text-g-muted hover:text-g-red transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-g-muted" style={{ fontFamily: 'Rajdhani', fontSize: '14px' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
