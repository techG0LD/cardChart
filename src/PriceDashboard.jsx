// src/PriceDashboard.jsx
// src/PriceDashboard.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function PriceDashboard() {
  const [cards, setCards]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [rarityFilter, setRarityFilter] = useState('All')

  useEffect(() => {
    async function fetchPrices() {
      const key = import.meta.env.VITE_POKE_PRICE_API_KEY

      try {
        const res = await axios.get('/api/v1/prices?limit=500', {
          headers: { Authorization: `Bearer ${key}` },
        })

        // dig out the array
        const arr =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data.data) ? res.data.data :
          Array.isArray(res.data.cards) ? res.data.cards :
          []

        // sort high → low by the same market price you’ll show
        arr.sort((a, b) => {
          const aPrice = a.cardmarket?.prices?.averageSellPrice ?? 0
          const bPrice = b.cardmarket?.prices?.averageSellPrice ?? 0
          return bPrice - aPrice
        })

        setCards(arr)
      } catch (err) {
        console.error('❌ fetch error:', err.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [])

  if (loading) return <p>Loading card prices…</p>

  // ————— Summary Stats —————
  // pull the exact same field you render below
  const sellPrices = cards
    .map(c => c.cardmarket?.prices?.averageSellPrice)
    .filter(p => typeof p === 'number')

  const total  = sellPrices.length
  const avg    = total
    ? (sellPrices.reduce((sum, p) => sum + p, 0) / total).toFixed(2)
    : '0.00'

  const sortedForMedian = [...sellPrices].sort((a, b) => a - b)
  const median = total
    ? sortedForMedian[Math.floor(total / 2)].toFixed(2)
    : '0.00'

  const range = total
    ? (Math.max(...sellPrices) - Math.min(...sellPrices)).toFixed(2)
    : '0.00'

  // ————— Filters & Search —————
  const uniqueRarities = [
    'All',
    ...Array.from(new Set(cards.map(c => c.rarity).filter(Boolean))),
  ]

  const displayed = cards.filter(card => {
    const nameMatch   = !search ||
      card.name.toLowerCase().includes(search.toLowerCase())
    const rarityMatch = rarityFilter === 'All' ||
      card.rarity === rarityFilter
    return nameMatch && rarityMatch
  })

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Pokémon Card Prices</h1>

      {/* Summary */}
      <p>
        Total: {total} | Avg: ${avg} | Median: ${median} | Range: ${range}
      </p>

      {/* Search + Rarity */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={rarityFilter}
          onChange={e => setRarityFilter(e.target.value)}
        >
          {uniqueRarities.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Card List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {displayed.map(card => (
          <li
            key={card.id}
            style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}
          >
            <img
              src={card.images.small}
              alt={card.name}
              width={50}
              height={50}
              style={{ marginRight: 12 }}
            />
            <div>
              <strong>{card.name}</strong> — $
              {card.cardmarket?.prices?.averageSellPrice?.toFixed(2) ?? 'N/A'}  
              <div style={{ fontSize: 12, color: '#666' }}>
                Rarity: {card.rarity || 'N/A'} | Set: {card.set_name || '–'}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
