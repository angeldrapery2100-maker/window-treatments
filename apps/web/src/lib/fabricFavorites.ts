'use client'

/**
 * Favourited fabrics, kept in localStorage under `hd_fabric_favorites`.
 *
 * Deliberately not an account feature: a visitor should be able to build a
 * shortlist and take it into /design without signing up for anything. When the
 * design profile goes to AAPP with an enquiry (blueprint §4.2) these ids are
 * what travels.
 */
export const FAVORITES_KEY = 'hd_fabric_favorites'
const MAX = 60

type Listener = (ids: string[]) => void
const listeners = new Set<Listener>()

export function readFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(ids: string[]) {
  try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids.slice(0, MAX))) } catch { /* private mode */ }
  listeners.forEach((fn) => fn(ids))
}

export function toggleFavorite(id: string): string[] {
  const cur = readFavorites()
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]
  write(next)
  return next
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id)
}

/** Fires on our own writes AND on writes from another tab. */
export function subscribeFavorites(fn: Listener): () => void {
  listeners.add(fn)
  const onStorage = (e: StorageEvent) => { if (e.key === FAVORITES_KEY) fn(readFavorites()) }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage) }
}
