import { useState, useCallback } from 'react'
import { DEFAULT_CARDS } from '../data/defaults'

const STORAGE_KEY = 'studytok_cards_v1'

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : [...DEFAULT_CARDS]
  } catch { return [...DEFAULT_CARDS] }
}

function save(cards) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)) } catch {}
}

export function useCards() {
  const [cards, setCards] = useState(load)

  const addCard = useCallback((card) => {
    setCards(prev => {
      const next = [...prev, card]
      save(next)
      return next
    })
  }, [])

  const addCards = useCallback((newCards) => {
    setCards(prev => {
      const next = [...prev, ...newCards]
      save(next)
      return next
    })
  }, [])

  const deleteCard = useCallback((index) => {
    setCards(prev => {
      const next = prev.filter((_, i) => i !== index)
      save(next)
      return next
    })
  }, [])

  return { cards, addCard, addCards, deleteCard }
}
