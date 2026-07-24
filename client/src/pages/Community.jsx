import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { MessageSquare, Plus, X, Send, Filter, Image, Video, Upload, Trash2, AlertCircle } from 'lucide-react'
import PostCard from '../components/PostCard'
import { PageLoader } from '../components/Loader'
import { useRole } from '../hooks/useRole'

const CATEGORIES = [
  { id: 'all',           label: 'All Posts' },
  { id: 'pubg-strategy', label: '⚔️ PUBG Strategy' },
  { id: 'pubg-clips',    label: '🎥 PUBG Clips' },
  { id: 'hardware',      label: '🖥️ Hardware' },
  { id: 'card-exchange', label: '💳 Card Exchanges' },
  { id: 'events',        label: '🏆 Events' },
  { id: 'introductions', label: '👋 Introductions' },
  { id: 'general',       label: '💬 General' },
]

const EMPTY_FORM = { title: '', content: '', category: 'general' }
const MAX_IMAGE_MB = 3
const MAX_VIDEO_MB = 40
const MAX_VIDEO_SECS = 45

/* ── Media uploader ───────────────────────────────────────────────────────── */
function MediaUploader({ onAdded, isSuperAdmin }) {
  const fileRef = useRef()
  const [previews, setPreviews] = useState([])   // { url, type, file, error }
  const [uploading, setUploading] = useState(false)
  const { getToken } = useAuth()

  const validate = (file) => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) return 'Only images and videos are allowed.'
    const sizeMB = file.size / 1024 / 1024
    if (!isSuperAdmin) {
      if (isImage && sizeMB > MAX_IMAGE_MB) return `Image must be under ${MAX_IMAGE_MB}MB (yours: ${sizeMB.toFixed(1)}MB).`
      if (isVideo && sizeMB > MAX_VIDEO_MB) return `Video must be under ${MAX_VIDEO_MB}MB (yours: ${sizeMB.toFixed(1)}MB).`
    }
    return null
  }

  const checkVideoDuration = (file) =>
    new Promise((resolve) => {
      if (!file.type.startsWith('video/')) return resolve(null)
      const vid = document.createElement('video')
      vid.preload = 'metadata'
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(vid.src)
        resolve(vid.duration)
      }
      vid.onerror = () => resolve(null)
      vid.src = URL.createObjectURL(file)
    })

  const handleFiles = async (files) => {
    const arr = Array.from(files)
    const currentVideos = previews.filter(p => !p.error && p.type === 'video')
    const currentImages = previews.filter(p => !p.error && p.type === 'image')

    for (const file of arr) {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      // Rule: can't add an image if a video is already queued
      if (isImage && currentVideos.length > 0) {
        setPreviews(p => [...p, { url: null, type: null, file, error: 'Remove the video first before adding images.' }])
        continue
      }

      // Rule: can't add a video if images are already queued
      if (isVideo && currentImages.length > 0) {
        setPreviews(p => [...p, { url: null, type: null, file, error: 'Remove all images first before adding a video.' }])
        continue
      }

      // Rule: only 1 video allowed
      if (isVideo && currentVideos.length >= 1) {
        setPreviews(p => [...p, { url: null, type: null, file, error: 'Only 1 video can be posted at a time.' }])
        continue
      }

      // Rule: max 4 images
      if (isImage && currentImages.length >= 4) {
        setPreviews(p => [...p, { url: null, type: null, file, error: 'Maximum 4 images per post.' }])
        continue
      }

      const sizeErr = validate(file)
      if (sizeErr) {
        setPreviews(p => [...p, { url: null, type: null, file, error: sizeErr }])
        continue
      }

      if (isVideo && !isSuperAdmin) {
        const dur = await checkVideoDuration(file)
        if (dur !== null && dur > MAX_VIDEO_SECS) {
          setPreviews(p => [...p, { url: null, type: null, file, error: `Video must be ≤${MAX_VIDEO_SECS}s (yours: ${Math.round(dur)}s).` }])
          continue
        }
      }

      const url = URL.createObjectURL(file)
      const type = isImage ? 'image' : 'video'
      setPreviews(p => [...p, { url, type, file, error: null, uploaded: false }])

      // Update running counts to correctly block further additions in the same batch
      if (isImage) currentImages.push({ type: 'image' })
      if (isVideo) currentVideos.push({ type: 'video' })
    }
  }

  const uploadAll = async () => {
    const pending = previews.filter(p => !p.error && !p.uploaded)
    if (!pending.length) return []
    setUploading(true)
    const token = await getToken()
    const results = []
    for (const item of pending) {
      const fd = new FormData()
      fd.append('file', item.file)
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        results.push({ url: data.url, type: data.type })
        setPreviews(p => p.map(pr => pr.file === item.file ? { ...pr, uploaded: true, serverUrl: data.url } : pr))
      } catch (e) {
        setPreviews(p => p.map(pr => pr.file === item.file ? { ...pr, error: e.message } : pr))
      }
    }
    setUploading(false)
    onAdded(results)
    return results
  }

  const remove = (idx) => {
    setPreviews(p => p.filter((_, i) => i !== idx))
  }

  // Expose uploadAll via ref so parent can call it
  useEffect(() => { if (onAdded._ref) onAdded._ref.current = uploadAll }, [previews])

  return (
    <div>
      {/* Drop zone */}
      <div
        className="media-upload-area"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
        onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleFiles(e.dataTransfer.files) }}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload size={24} style={{ color: 'var(--muted)' }} />
          <p className="font-barlow uppercase tracking-wider text-sm" style={{ color: 'var(--muted)', letterSpacing: '0.08em' }}>
            Click or drag files here
          </p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>
            {isSuperAdmin
              ? 'Up to 4 images · OR 1 video (no size limit)'
              : `Up to 4 images ≤${MAX_IMAGE_MB}MB each · OR 1 video ≤${MAX_VIDEO_MB}MB, ≤${MAX_VIDEO_SECS}s`}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="post-media-grid mt-3">
          {previews.map((item, i) => (
            <div key={i} className="post-media-item" style={{ position: 'relative' }}>
              {item.error ? (
                <div className="flex flex-col items-center justify-center h-full gap-1 p-2 text-center"
                  style={{ background: 'rgba(232,58,58,0.1)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--red)' }} />
                  <span style={{ fontFamily: 'Rajdhani', fontSize: '11px', color: 'var(--red)' }}>{item.error}</span>
                </div>
              ) : item.type === 'image' ? (
                <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
              )}
              {/* Uploaded badge */}
              {item.uploaded && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(58,232,88,0.8)', fontSize: '9px', fontFamily: 'Barlow Condensed', color: '#0a0a0f', fontWeight: 700 }}>
                  ✓ UPLOADED
                </div>
              )}
              {/* Remove button */}
              <button onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {previews.some(p => !p.error && !p.uploaded) && (
        <button
          className="btn btn-ghost text-xs mt-3 w-full justify-center"
          onClick={uploadAll}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : `Upload ${previews.filter(p => !p.error && !p.uploaded).length} file(s)`}
        </button>
      )}
    </div>
  )
}


/* ── Delete uploaded files from server (used on cancel) ─── */
async function deleteUploadedFiles(uploadedUrls, getToken) {
  if (!uploadedUrls.length) return
  try {
    const token = await getToken()
    await fetch('/api/uploads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ urls: uploadedUrls }),
    })
  } catch {}
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams()
  const catParam = searchParams.get('cat') || 'all'

  const [posts, setPosts]           = useState([])
  // Remove a post from the feed (after deletion in PostCard)
  const removePost = (postId) => setPosts(prev => prev.filter(p => String(p._id) !== String(postId)))
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm]     = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [media, setMedia]           = useState([])   // uploaded media
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')

  const { isSignedIn, getToken }    = useAuth()
  const { isSuperAdmin }            = useRole()
  const uploaderRef                 = useRef(null)

  const fetchPosts = async (cat = catParam, pg = 1) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: pg, limit: 20 })
      if (cat !== 'all') qs.set('category', cat)
      const res = await fetch(`/api/posts?${qs}`)
      const data = await res.json()
      setPosts(pg === 1 ? (data.posts || []) : prev => [...prev, ...(data.posts || [])])
      setTotalPages(data.pages || 1)
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { setPage(1); fetchPosts(catParam, 1) }, [catParam])

  const setCategory = (cat) => {
    setPage(1)
    setMobileFiltersOpen(false)
    cat === 'all' ? setSearchParams({}) : setSearchParams({ cat })
  }

  const handleMediaAdded = (newMedia) => {
    setMedia(prev => [...prev, ...newMedia])
  }

  const submitPost = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError('Title and content are required.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      // Upload any pending files first
      if (uploaderRef.current) {
        const freshUploads = await uploaderRef.current()
        var allMedia = [...media, ...freshUploads]
      } else {
        var allMedia = [...media]
      }

      const token = await getToken()
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, media: allMedia }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to post')
      const newPost = await res.json()
      setPosts(prev => [newPost, ...prev])
      setForm(EMPTY_FORM)
      setMedia([])
      setShowForm(false)
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Attach ref for upload trigger
  handleMediaAdded._ref = uploaderRef

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(catParam, next)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center"
              style={{ background: 'rgba(240,132,44,0.1)', border: '1px solid rgba(240,132,44,0.2)' }}>
              <MessageSquare size={20} style={{ color: 'var(--orange)' }} />
            </div>
            <span className="section-label">Community</span>
          </div>
          <h1 className="font-barlow font-800 uppercase tracking-wide" style={{ fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--text)' }}>
            Discussion Forum
          </h1>
          <p style={{ fontFamily: 'Rajdhani', fontSize: '15px', color: 'var(--muted)', marginTop: 4 }}>
            Share strategies, ask questions, introduce yourself, or just chat gaming.
          </p>
        </div>

        {isSignedIn ? (
          <button className="btn btn-primary shrink-0 hidden sm:inline-flex" onClick={() => setShowForm(o => !o)}>
            <Plus size={16} /> New Post
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="btn btn-ghost shrink-0">Sign in to Post</button>
          </SignInButton>
        )}
      </div>

      {/* ── New Post Form ── */}
      {showForm && (
        <div className="social-post-card p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-barlow font-700 text-xl uppercase tracking-wide" style={{ color: 'var(--text)' }}>
              New Post
            </h3>
            <button onClick={async () => {
                const serverUrls = media.map(m => m.url).filter(Boolean)
                setShowForm(false)
                setMedia([])
                setForm(EMPTY_FORM)
                await deleteUploadedFiles(serverUrls, getToken)
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <div className="input-label">Category</div>
              <select className="input mt-1" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <div className="input-label">Title</div>
              <input type="text" className="input mt-1"
                placeholder="Give your post a clear, descriptive title…"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={120} />
            </div>

            {/* Content */}
            <div>
              <div className="input-label">Content</div>
              <textarea className="input mt-1" rows={6}
                placeholder="Write your post here…"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>

            {/* Media upload */}
            <div>
              <div className="input-label flex items-center gap-2">
                <Image size={11} style={{ color: 'var(--orange)' }} />
                Media
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>
                  (optional · images &amp; short videos)
                </span>
              </div>
              <div className="mt-1">
                <MediaUploader onAdded={handleMediaAdded} isSuperAdmin={isSuperAdmin} />
              </div>
              {/* Show already-uploaded count */}
              {media.length > 0 && (
                <p style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', color: 'var(--green)', marginTop: 6 }}>
                  ✓ {media.length} file(s) ready to attach
                </p>
              )}
            </div>

            {formError && (
              <p className="flex items-center gap-2" style={{ color: 'var(--red)', fontFamily: 'Rajdhani', fontSize: '14px' }}>
                <AlertCircle size={14} /> {formError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={async () => {
                const serverUrls = media.map(m => m.url).filter(Boolean)
                setShowForm(false)
                setMedia([])
                setForm(EMPTY_FORM)
                await deleteUploadedFiles(serverUrls, getToken)
              }}>Cancel</button>
              <button className="btn btn-primary" onClick={submitPost} disabled={submitting}>
                <Send size={14} />
                {submitting ? 'Posting…' : 'Post Discussion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category filter ── */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn btn-ghost text-xs px-3 py-1.5 flex items-center gap-2 sm:hidden"
            onClick={() => setMobileFiltersOpen(open => !open)}
            style={{ fontFamily: 'Barlow Condensed', letterSpacing: '0.05em' }}
          >
            <Filter size={13} /> {mobileFiltersOpen ? 'Hide Filters' : 'Filter'}
          </button>

          <div className="inline-flex items-center gap-2 flex-wrap">
            <span className="badge badge-general"
              style={{ background: 'rgba(240,132,44,0.12)', color: 'var(--orange)', borderColor: 'rgba(240,132,44,0.4)' }}>
              {CATEGORIES.find(c => c.id === catParam)?.label || 'All Posts'}
            </span>
            {catParam !== 'all' && (
              <button
                type="button"
                onClick={() => setCategory('all')}
                className="btn btn-ghost text-xs px-3 py-1.5"
                style={{ fontFamily: 'Barlow Condensed', letterSpacing: '0.05em' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <Filter size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="btn text-xs px-3 py-1.5"
              style={{
                background:    catParam === c.id ? 'rgba(240,132,44,0.15)' : 'transparent',
                color:         catParam === c.id ? 'var(--orange)' : 'var(--muted)',
                border:        `1px solid ${catParam === c.id ? 'rgba(240,132,44,0.5)' : 'var(--border)'}`,
                fontFamily:    'Barlow Condensed',
                letterSpacing: '0.05em',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className={`mobile-filter-panel space-y-2 sm:hidden ${mobileFiltersOpen ? 'open' : ''}`}
          aria-hidden={!mobileFiltersOpen}>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className="btn text-xs px-3 py-1.5"
                style={{
                  background:    catParam === c.id ? 'rgba(240,132,44,0.15)' : 'transparent',
                  color:         catParam === c.id ? 'var(--orange)' : 'var(--muted)',
                  border:        `1px solid ${catParam === c.id ? 'rgba(240,132,44,0.5)' : 'var(--border)'}`,
                  fontFamily:    'Barlow Condensed',
                  letterSpacing: '0.05em',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCategory('all')}
            className="btn btn-ghost text-xs px-3 py-1.5"
            style={{ fontFamily: 'Barlow Condensed', letterSpacing: '0.05em' }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* ── Posts list ── */}
      {loading && posts.length === 0 ? (
        <PageLoader label="Loading discussions…" />
      ) : posts.length === 0 ? (
        <div className="text-center py-16 social-post-card">
          <MessageSquare size={40} className="mx-auto mb-4" style={{ color: 'var(--orange)', opacity: 0.4 }} />
          <p className="font-barlow uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            No posts yet in this category
          </p>
          {isSignedIn && (
            <button className="btn btn-ghost text-sm mt-4" onClick={() => setShowForm(true)}>
              Be the first to post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={post._id} className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
              <PostCard post={post} onDelete={removePost} />
            </div>
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      {page < totalPages && (
        <div className="text-center mt-8">
          <button className="btn btn-ghost" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load More Posts'}
          </button>
        </div>
      )}

      {isSignedIn && (
        <button className="new-post-floating" onClick={() => setShowForm(true)} aria-label="New Post">
          <Plus size={18} />
          <span>New Post</span>
        </button>
      )}
    </div>
  )
}
