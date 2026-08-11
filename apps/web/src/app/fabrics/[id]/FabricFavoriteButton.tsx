'use client'

import { useEffect, useState } from 'react'
import { readFavorites, subscribeFavorites, toggleFavorite } from '@/lib/fabricFavorites'

export default function FabricFavoriteButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const sync = (ids: string[]) => setSaved(ids.includes(id))
    sync(readFavorites())
    return subscribeFavorites(sync)
  }, [id])

  return (
    <button
      onClick={() => toggleFavorite(id)}
      aria-pressed={saved}
      className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-800 hover:border-gray-500"
    >
      {saved ? 'Saved to My Fabrics' : 'Save to My Fabrics'}
    </button>
  )
}
