import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { MessageSquare, Plus, X, Send, Filter } from 'lucide-react'
import PostCard from '../components/PostCard'

const CATEGORIES = [
  { id: 'all',            label: 'All Posts' },
  { id: 'pubg-strategy',  label: '⚔️ PUBG Strategy' },
  { id: 'pubg-clips',     label: '🎥 PUBG Clips' },
  { id: 'hardware',       label: '🖥️ Hardware' },
  { id: 'events',         label: '🏆 Events' },
  { id: 'introductions',  label: '👋 Introductions' },
  { id: 'general',        label: '💬 General' },
]

const EMPTY_FORM = { title: '', content: '', category: 'general' }

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams()
  const catParam = searchParams.get('cat') || 'all'

  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const { isSignedIn, getToken } = useAuth()

  const fetchPosts = async (cat = catParam, pg = 1) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: pg, limit: 20 })
      if (cat !== 'all') qs.set('category', cat)
      const res = await fetch(`/api/posts?${qs}`)
      const data = await res.json()
      setPosts(pg === 1 ? data.posts : prev => [...prev, ...data.posts])
      setTotalPages(data.pages)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchPosts(catParam, 1)
  }, [catParam])

  const setCategory = (cat) => {
    if (cat === 'all') setSearchParams({})
    else setSearchParams({ cat })
  }

  const submitPost = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError('Title and content are required.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to post')
      const newPost = await res.json()
      setPosts(prev => [newPost, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(catParam, next)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-g-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(240,132,44,0.1)', border: '1px solid rgba(240,132,44,0.2)' }}>
              <MessageSquare size={20} className="text-g-orange" />
            </div>
            <span className="section-label">Community</span>
          </div>
          <h1 className="font-barlow font-800 text-3xl md:text-4xl text-g-text uppercase tracking-wide">Discussion Forum</h1>
          <p className="text-g-muted mt-1" style={{ fontFamily: 'Rajdhani', fontSize: '15px' }}>
            Share strategies, ask questions, introduce yourself, or just chat gaming.
          </p>
        </div>

        {isSignedIn ? (
          <button
            className="btn btn-primary shrink-0"
            onClick={() => setShowForm(o => !o)}
          >
            <Plus size={16} /> New Post
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="btn btn-ghost shrink-0">
              Sign in to Post
            </button>
          </SignInButton>
        )}
      </div>

      {/* New Post Form */}
      {showForm && (
        <div className="gaming-card p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-barlow font-700 text-xl uppercase tracking-wide text-g-text">New Post</h3>
            <button onClick={() => setShowForm(false)} className="text-g-muted hover:text-g-text">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="input-label">Category</div>
              <select
                className="input mt-1"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="input-label">Title</div>
              <input
                type="text"
                className="input mt-1"
                placeholder="Give your post a clear, descriptive title…"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={120}
              />
            </div>
            <div>
              <div className="input-label">Content</div>
              <textarea
                className="input mt-1"
                rows={6}
                placeholder="Write your post here…"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>
            {formError && <p className="text-g-red text-sm">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitPost} disabled={submitting}>
                <Send size={14} />
                {submitting ? 'Posting…' : 'Post Discussion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={13} className="text-g-muted shrink-0" />
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className="btn text-xs px-3 py-1.5 transition-all"
            style={{
              background:   catParam === c.id ? 'rgba(240,132,44,0.15)' : 'transparent',
              color:        catParam === c.id ? '#F0842C' : '#8888AA',
              border:       `1px solid ${catParam === c.id ? 'rgba(240,132,44,0.5)' : '#2a2a3a'}`,
              fontFamily:   'Barlow Condensed',
              letterSpacing: '0.05em',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {loading && posts.length === 0 ? (
        <div className="text-center py-16 text-g-muted">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
          <p style={{ fontFamily: 'Rajdhani' }}>Loading discussions…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 gaming-card">
          <MessageSquare size={40} className="mx-auto mb-4 text-g-orange opacity-40" />
          <p className="text-g-muted mb-2 font-barlow uppercase tracking-wide">No posts yet in this category</p>
          {isSignedIn && (
            <button className="btn btn-ghost text-sm mt-2" onClick={() => setShowForm(true)}>
              Be the first to post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={post._id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {page < totalPages && (
        <div className="text-center mt-8">
          <button className="btn btn-ghost" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load More Posts'}
          </button>
        </div>
      )}
    </div>
  )
}
