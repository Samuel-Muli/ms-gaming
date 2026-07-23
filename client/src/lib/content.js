// Thin client for GET /api/content — replaces the old pattern of
// `import { articles } from '../data/articles'`, which shipped the entire
// back catalog as JS to every visitor on every page. The data files still
// exist and are still what you edit (see scripts/sync-content.js at the
// repo root) — this just fetches them instead of bundling them.
import { useEffect, useState } from 'react'

export async function fetchContent({ category, featured, limit, page } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (featured !== undefined) params.set('featured', String(featured))
  if (limit) params.set('limit', String(limit))
  if (page) params.set('page', String(page))
  const res = await fetch(`/api/content?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load content')
  return res.json() // { items, total, pages }
}

export async function fetchContentBySlug(slug) {
  const res = await fetch(`/api/content/${encodeURIComponent(slug)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load article')
  return res.json()
}

/**
 * Fetches every item in a category (up to `limit`) — for pages that filter
 * or search client-side over "all articles in this category", same as the
 * old imported-array pattern, just sourced from the API instead of the JS
 * bundle.
 */
export function useContentList({ category, featured, limit = 200 } = {}) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchContent({ category, featured, limit })
      .then(data => { if (!cancelled) { setItems(data.items); setTotal(data.total) } })
      .catch(err => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [category, featured, limit])

  return { items, total, loading, error }
}

export function useContentBySlug(slug) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetchContentBySlug(slug)
      .then(data => { if (!cancelled) setItem(data) })
      .catch(err => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { item, loading, error }
}
