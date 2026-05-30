import { useState, useRef, useCallback } from 'react'
import { PALETTE, TYPE_LABEL } from './data/defaults'
import { useCards } from './hooks/useCards'
import { ConceptCard, QuizCard, MemoryCard } from './components/Cards'
import AddPanel from './components/AddPanel'
import ChatAssistant from './components/ChatAssistant'
import Toast from './components/Toast'
import Particles from './components/Particles'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// ── Onboarding screen ──────────────────────────────────────────────
function Onboard({ onStart }) {
  return (
    <div style={{
      minHeight: '100dvh', fontFamily: 'Nunito, sans-serif',
      background: 'linear-gradient(135deg,#f5f0ff 0%,#fff0f7 50%,#f0fdf8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 32, textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated blobs */}
      {[
        ['rgba(196,181,253,0.65)', '-8%', '-5%', '14s', '0s'],
        ['rgba(249,168,212,0.55)', 'auto', '-5%', '11s', '-4s'],
        ['rgba(167,243,208,0.5)',  '42%', '25%', '17s', '-8s'],
      ].map(([bg, top, right, dur, delay], i) => (
        <div key={i} style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: bg, filter: 'blur(65px)',
          top, right, bottom: top === 'auto' ? '-5%' : undefined,
          animation: `drift ${dur} ease-in-out infinite alternate`,
          animationDelay: delay, pointerEvents: 'none',
        }} />
      ))}

      <div style={{
        fontSize: 'clamp(2.4rem,8vw,3.8rem)', fontWeight: 900,
        letterSpacing: '-0.05em', marginBottom: 8, position: 'relative',
        background: 'linear-gradient(135deg,#7c3aed 0%,#be185d 50%,#047857 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite',
      }}>StudyTok 🌸</div>

      <div style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 340, marginBottom: 28, position: 'relative' }}>
        El scroll adictivo del feed, pero para aprender de verdad.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 340, marginBottom: 28, position: 'relative' }}>
        {[
          ['👆', 'Desliza hacia arriba para avanzar'],
          ['📎', 'Sube tu PDF y la IA genera tarjetas automáticamente'],
          ['🤖', 'Asistente de IA integrado para investigar temas'],
          ['🔥', 'Racha y XP para mantenerte enganchada'],
          ['💾', 'Todo se guarda automáticamente en tu navegador'],
        ].map(([em, txt]) => (
          <div key={em} style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14,
            padding: '10px 14px', display: 'flex', alignItems: 'center',
            gap: 12, textAlign: 'left', fontSize: '0.88rem', color: '#374151',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{em}</span>{txt}
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        background: 'linear-gradient(135deg,#7c3aed,#be185d)',
        backgroundSize: '200% 200%', animation: 'gradient-shift 3s ease infinite',
        color: '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 900,
        fontSize: '1.05rem', padding: '15px 48px', border: 'none',
        borderRadius: 50, cursor: 'pointer', position: 'relative',
        boxShadow: '0 6px 28px rgba(124,58,237,0.4)',
      }}>
        Empezar ⚡
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 50,
          background: 'linear-gradient(135deg,#7c3aed,#be185d)',
          animation: 'pulse-ring 2s ease-out infinite', zIndex: -1,
        }} />
      </button>
    </div>
  )
}

// ── Main feed ──────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('onboard')
  const { cards, addCard, addCards } = useCards()
  const [deck, setDeck] = useState([])
  const [idx, setIdx] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [answered, setAnswered] = useState({})
  const [toast, setToast] = useState({ show: false, emoji: '', text: '', sub: '' })
  const [particle, setParticle] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isAnim, setIsAnim] = useState(false)
  const touchY = useRef(0)
  const toastTimer = useRef(null)

  function start() {
    setDeck(shuffle(cards))
    setIdx(0)
    setAnswered({})
    setScreen('feed')
  }

  function showToast(emoji, text, sub = '') {
    setToast({ show: true, emoji, text, sub })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  function goNext() {
    if (isAnim || idx >= deck.length - 1) return
    setIsAnim(true)
    setIdx(i => i + 1)
    setTimeout(() => setIsAnim(false), 420)
  }
  function goPrev() {
    if (isAnim || idx <= 0) return
    setIsAnim(true)
    setIdx(i => i - 1)
    setTimeout(() => setIsAnim(false), 420)
  }

  function handleAnswer(ci, oi) {
    if (answered[`${ci}-done`]) return
    const card = deck[ci]
    const correct = card.options[oi].correct
    const update = { [`${ci}-done`]: true, [`${ci}-${oi}`]: correct ? 'correct' : 'wrong' }
    if (!correct) {
      card.options.forEach((_, i) => { if (card.options[i].correct) update[`${ci}-${i}`] = 'correct' })
      update[`${ci}-exp`] = true
      setStreak(0)
      showToast('😅', '¡Casi!', 'Revisa la explicación')
    } else {
      const pts = 10 + streak * 2
      setXp(x => x + pts)
      setStreak(s => s + 1)
      setParticle(p => p + 1)
      showToast('🎉', '¡Correcto!', `+${pts} XP · Racha ${streak + 1}🔥`)
    }
    setAnswered(a => ({ ...a, ...update }))
  }

  function handleSaveCard(card) {
    addCard(card)
    setDeck(prev => [...prev, card])
    showToast('🃏', '¡Tarjeta guardada!', `${cards.length + 1} en total`)
  }

  function handleSaveMany(newCards) {
    addCards(newCards)
    setDeck(prev => [...prev, ...newCards])
    showToast('🃏', `${newCards.length} tarjetas guardadas!`, '')
  }

  const current = deck[idx]
  const p = current ? PALETTE[current.type] : PALETTE.concept
  const pct = deck.length ? ((idx + 1) / deck.length * 100).toFixed(0) : 0

  if (screen === 'onboard') return <Onboard onStart={start} />

  return (
    <div
      style={{
        height: '100dvh', background: p.bg, fontFamily: 'Nunito, sans-serif',
        overflow: 'hidden', position: 'relative', userSelect: 'none',
        transition: 'background 0.5s',
      }}
      onTouchStart={e => { touchY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dy = touchY.current - e.changedTouches[0].clientY
        if (Math.abs(dy) > 50) dy > 0 ? goNext() : goPrev()
      }}
    >
      {/* Animated background blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 380, height: 380, borderRadius: '50%',
          background: p.blob1, filter: 'blur(70px)',
          top: '-8%', left: '-6%',
          animation: 'drift 14s ease-in-out infinite alternate',
          transition: 'background 0.6s',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: p.blob2, filter: 'blur(60px)',
          bottom: '-6%', right: '-5%',
          animation: 'drift 11s ease-in-out infinite alternate',
          animationDelay: '-4s', transition: 'background 0.6s',
        }} />
      </div>

      {/* Top stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: p.stripe, zIndex: 10, transition: 'background 0.4s',
      }} />

      {/* HUD top */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px',
        background: `linear-gradient(to bottom, ${p.bg}f0, ${p.bg}00)`,
        transition: 'background 0.5s',
      }}>
        <div style={{
          fontWeight: 900, fontSize: '1.05rem',
          background: 'linear-gradient(135deg,#7c3aed,#be185d)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>StudyTok 🌸</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Chat button */}
          <button onClick={() => setShowChat(true)} style={{
            background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(0,0,0,0.08)',
            borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, color: '#6d28d9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>🤖 Asistente</button>
          <div style={{
            background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(0,0,0,0.08)',
            borderRadius: 20, padding: '3px 11px', fontFamily: 'Space Mono, monospace',
            fontSize: '0.72rem', fontWeight: 700, color: '#92400e',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 5,
          }}>🔥 <b>{streak}</b></div>
          <div style={{
            background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(0,0,0,0.08)',
            borderRadius: 20, padding: '3px 11px', fontFamily: 'Space Mono, monospace',
            fontSize: '0.72rem', fontWeight: 700, color: '#374151',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>⭐ {xp}</div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ position: 'relative', height: '100dvh', zIndex: 1 }}>
        {deck.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 14, textAlign: 'center', padding: 32,
          }}>
            <div style={{ fontSize: '3rem' }}>📭</div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#4c1d95' }}>Sin tarjetas aún</div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', maxWidth: 260, lineHeight: 1.6 }}>
              Toca el ＋ para agregar tu primera tarjeta
            </div>
          </div>
        ) : deck.map((card, i) => {
          const pos = i < idx ? 'above' : i === idx ? 'active' : 'below'
          const sharedProps = { card, pos, key: i }

          if (card.type === 'concept' || card.type === 'fact') {
            return <ConceptCard {...sharedProps} />
          } else if (card.type === 'quiz') {
            return <QuizCard {...sharedProps} cardIdx={i} answered={answered} onAnswer={handleAnswer} />
          } else if (card.type === 'memory') {
            return <MemoryCard {...sharedProps} onFlip={() => { setXp(x => x + 5) }} />
          }
          return null
        })}
      </div>

      {/* Keyboard nav */}
      <div tabIndex={0} style={{ position: 'fixed', inset: 0, zIndex: -1, outline: 'none' }}
        onKeyDown={e => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') goNext()
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') goPrev()
        }} />

      {/* Wheel nav */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}
        onWheel={e => { e.stopPropagation(); e.deltaY > 0 ? goNext() : goPrev() }} />

      {/* Bottom HUD */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        padding: '12px 20px 26px',
        background: `linear-gradient(to top, ${p.bg}f8 60%, ${p.bg}00)`,
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background 0.5s',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', color: '#9ca3af', marginBottom: 6 }}>
            {deck.length ? `${idx + 1} / ${deck.length} tarjetas` : '0 tarjetas'}
          </div>
          <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: pct + '%', borderRadius: 5,
              background: `linear-gradient(90deg,${p.accent},#be185d)`,
              transition: 'width 0.4s ease, background 0.5s',
            }} />
          </div>
        </div>
        <div style={{
          fontFamily: 'Space Mono, monospace', fontSize: '0.6rem',
          color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        }}>
          <span style={{ animation: 'bob 1.4s infinite', display: 'inline-block' }}>↑</span> desliza
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed,#be185d)',
          boxShadow: '0 4px 18px rgba(124,58,237,0.4)',
          color: '#fff',
        }}>＋</button>
      </div>

      <Toast toast={toast} />
      <Particles trigger={particle} />
      {showAdd && (
        <AddPanel
          onClose={() => setShowAdd(false)}
          onSave={handleSaveCard}
          onSaveMany={handleSaveMany}
          showToast={showToast}
        />
      )}
      {showChat && (
        <ChatAssistant
          onClose={() => setShowChat(false)}
          onSaveCards={handleSaveMany}
          showToast={showToast}
        />
      )}
    </div>
  )
}
