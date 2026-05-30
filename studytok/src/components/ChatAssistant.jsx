import { useState, useRef, useEffect } from 'react'

export default function ChatAssistant({ onClose, onSaveCards, showToast }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! 👋 Soy tu asistente de estudio. Pregúntame sobre cualquier tema de tus cursos y te explico, o dime "genera tarjetas sobre X" para crear tarjetas de estudio.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const txt = input.trim()
    if (!txt || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: txt }])
    setLoading(true)

    const isCardRequest = /generar?|crea|tarjetas?|flashcards?/i.test(txt)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: txt,
          count: 3,
          mode: isCardRequest ? 'cards' : 'chat',
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (isCardRequest && data.cards) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `Generé ${data.cards.length} tarjetas de estudio sobre ese tema. ¿Las agrego a tu deck?`,
          cards: data.cards,
        }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Error de conexión. Revisa que tu API key esté configurada en Vercel.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: '#fff', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1rem', color: '#1e1b4b' }}>Asistente de estudio 🤖</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Space Mono, monospace' }}>Pregunta lo que quieras · genera tarjetas</div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(0,0,0,0.06)', border: 'none', color: '#6b7280',
          fontSize: '1rem', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12,
          }}>
            <div style={{
              maxWidth: '82%', padding: '12px 15px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user'
                ? 'linear-gradient(135deg,#7c3aed,#be185d)'
                : '#fff',
              color: m.role === 'user' ? '#fff' : '#1e1b4b',
              fontSize: '0.9rem', lineHeight: 1.6,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: m.role === 'assistant' ? '1px solid rgba(0,0,0,0.07)' : 'none',
            }}>
              {m.text}
              {m.cards && (
                <button onClick={() => { onSaveCards(m.cards); showToast('🃏', `${m.cards.length} tarjetas guardadas!`, ''); }} style={{
                  display: 'block', marginTop: 10, padding: '8px 16px',
                  background: 'linear-gradient(135deg,#7c3aed,#be185d)', color: '#fff',
                  border: 'none', borderRadius: 20, cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem',
                }}>
                  ✓ Agregar {m.cards.length} tarjetas al deck
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: '18px 18px 18px 4px', padding: '12px 18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)', color: '#6b7280', fontSize: '1.2rem',
            }}>
              <span style={{ animation: 'bob 0.8s infinite', display: 'inline-block', marginRight: 4 }}>●</span>
              <span style={{ animation: 'bob 0.8s 0.2s infinite', display: 'inline-block', marginRight: 4 }}>●</span>
              <span style={{ animation: 'bob 0.8s 0.4s infinite', display: 'inline-block' }}>●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '6px 16px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
        {['Explícame idoneidad en consumidor', 'Genera tarjetas sobre IR', '¿Qué es la libertad sindical?', 'Diferencia entre hábeas corpus y amparo'].map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 20,
            border: '1.5px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)',
            color: '#6d28d9', fontFamily: 'inherit', fontSize: '0.78rem',
            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{s}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px 24px', background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Pregunta algo o pide tarjetas sobre un tema..."
          style={{
            flex: 1, background: '#f5f0ff', border: '1.5px solid rgba(124,58,237,0.2)',
            borderRadius: 50, padding: '10px 18px', color: '#1e1b4b',
            fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none',
          }} />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg,#7c3aed,#be185d)', color: '#fff',
          fontSize: '1.1rem', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
          opacity: input.trim() && !loading ? 1 : 0.5, flexShrink: 0,
        }}>→</button>
      </div>
    </div>
  )
}
