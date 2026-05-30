import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_CARDS } from '../data/defaults'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function fetchCards() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cards?order=created_at.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  })
  if (!res.ok) throw new Error('Error al cargar tarjetas')
  return res.json()
}

async function insertCard(card) {
  const payload = {
    type: card.type,
    subject: card.subject || null,
    title: card.title || null,
    body: card.body || null,
    question: card.question || null,
    options: card.options ? card.options : null,
    explanation: card.explanation || null,
    front: card.front || null,
    back: card.back || null,
    emoji: card.emoji || null,
    color: card.color || null,
    narrative: card.narrative || null,
    comparison: card.comparison || null,
    left_side: card.left || null,
    right_side: card.right || null,
    points: card.points ? card.points : null,
    icon: card.icon || null,
    highlight: card.highlight || null,
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cards`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Error al guardar tarjeta')
  return res.json()
}

// Normalize card from Supabase to app format
function normalize(c) {
  return {
    ...c,
    left: c.left_side || c.left,
    right: c.right_side || c.right,
  }
}

export function useCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        // Fallback to defaults if env vars not set
        setCards(DEFAULT_CARDS)
        return
      }
      const data = await fetchCards()
      if (data.length === 0) {
        // First time — seed with defaults
        for (const card of DEFAULT_CARDS) {
          await insertCard(card)
        }
        const seeded = await fetchCards()
        setCards(seeded.map(normalize))
      } else {
        setCards(data.map(normalize))
      }
    } catch (e) {
      setError(e.message)
      setCards(DEFAULT_CARDS)
    } finally {
      setLoading(false)
    }
  }

  const addCard = useCallback(async (card) => {
    try {
      await insertCard(card)
      const fresh = await fetchCards()
      setCards(fresh.map(normalize))
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const addCards = useCallback(async (newCards) => {
    try {
      for (const card of newCards) {
        await insertCard(card)
      }
      const fresh = await fetchCards()
      setCards(fresh.map(normalize))
    } catch (e) {
      setError(e.message)
    }
  }, [])

  return { cards, loading, error, addCard, addCards, reload: load }
}
