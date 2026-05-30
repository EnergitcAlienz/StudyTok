import { useState } from 'react'
import { PALETTE, TYPE_LABEL } from '../data/defaults'

// ── Shared card wrapper ────────────────────────────────────────────
export function CardShell({ card, pos, children }) {
  const p = PALETTE[card.type] || PALETTE.concept
  const transforms = {
    below:  'translateY(100%)',
    above:  'translateY(-100%)',
    active: 'translateY(0)',
  }
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '80px 22px 110px',
      background: p.grad,
      transform: transforms[pos],
      opacity: pos === 'above' ? 0 : 1,
      transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s',
    }}>
      {/* Top stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: p.stripe }} />

      {/* Badge + subject */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '5px 12px', borderRadius: 20, marginBottom: 12,
        background: p.badge, border: `1.5px solid ${p.badgeBorder}`, color: p.badgeText,
      }}>
        {TYPE_LABEL[card.type]}
      </div>
      <div style={{
        fontFamily: 'Space Mono, monospace', fontSize: '0.62rem',
        color: p.muted, marginBottom: 10, letterSpacing: '0.06em', opacity: 0.7,
      }}>
        {card.subject}
      </div>

      {children}
    </div>
  )
}

// ── Concept / Fact ─────────────────────────────────────────────────
export function ConceptCard({ card, pos }) {
  const p = PALETTE[card.type]
  return (
    <CardShell card={card} pos={pos}>
      <div style={{
        fontSize: 'clamp(1.25rem,4.5vw,1.85rem)', fontWeight: 900,
        textAlign: 'center', marginBottom: 14, lineHeight: 1.2, color: p.title,
      }}>{card.title}</div>
      <div style={{
        fontSize: 'clamp(0.9rem,2.8vw,1.05rem)', color: p.body,
        textAlign: 'center', lineHeight: 1.75, maxWidth: 500, opacity: 0.88,
      }}>{card.body}</div>
    </CardShell>
  )
}

// ── Quiz ───────────────────────────────────────────────────────────
export function QuizCard({ card, pos, cardIdx, answered, onAnswer }) {
  const p = PALETTE.quiz
  return (
    <CardShell card={card} pos={pos}>
      <div style={{
        fontSize: 'clamp(1.1rem,4vw,1.6rem)', fontWeight: 900,
        textAlign: 'center', marginBottom: 10, lineHeight: 1.2, color: p.title,
      }}>{card.title}</div>
      <div style={{
        fontSize: '0.9rem', color: p.body, textAlign: 'center',
        marginBottom: 16, lineHeight: 1.65, maxWidth: 460, opacity: 0.85,
      }}>{card.question}</div>

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {card.options.map((opt, oi) => {
          const state = answered[`${cardIdx}-${oi}`]
          return (
            <button key={oi}
              onClick={() => onAnswer(cardIdx, oi)}
              style={{
                padding: '12px 16px', borderRadius: 14,
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem',
                textAlign: 'left', cursor: answered[`${cardIdx}-done`] ? 'default' : 'pointer',
                transition: 'all 0.18s', fontWeight: state ? 700 : 500,
                background: state === 'correct'
                  ? 'rgba(52,211,153,0.18)'
                  : state === 'wrong'
                  ? 'rgba(239,68,68,0.1)'
                  : p.optBg,
                border: `1.5px solid ${
                  state === 'correct' ? '#059669'
                  : state === 'wrong' ? '#ef4444'
                  : p.optBorder
                }`,
                color: state === 'correct' ? '#065f46'
                  : state === 'wrong' ? '#991b1b'
                  : p.body,
              }}>
              {opt.text}
            </button>
          )
        })}
      </div>

      {answered[`${cardIdx}-exp`] && card.explanation && (
        <div style={{
          marginTop: 14, background: 'rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12,
          padding: '12px 15px', fontSize: '0.82rem', color: p.body,
          lineHeight: 1.65, maxWidth: 480, textAlign: 'left', opacity: 0.85,
        }}>
          💡 {card.explanation}
        </div>
      )}
    </CardShell>
  )
}

// ── Memory flip card ───────────────────────────────────────────────
export function MemoryCard({ card, pos, onFlip }) {
  const [flipped, setFlipped] = useState(false)
  const p = PALETTE.memory

  function handleFlip() {
    setFlipped(f => !f)
    if (!flipped) onFlip?.()
  }

  return (
    <CardShell card={card} pos={pos}>
      <div style={{
        fontSize: 'clamp(1.1rem,4vw,1.6rem)', fontWeight: 900,
        textAlign: 'center', marginBottom: 10, color: p.title,
      }}>Tarjeta de memoria</div>

      <div onClick={handleFlip} style={{
        width: '100%', maxWidth: 420, height: 180,
        perspective: 1000, cursor: 'pointer', marginTop: 8,
      }}>
        <div style={{
          width: '100%', height: '100%', position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'none',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 24, textAlign: 'center',
            fontSize: '1rem', lineHeight: 1.55, fontWeight: 600,
            background: p.flipFront,
            border: `1.5px solid ${p.flipBorder}`,
            color: p.flipText,
          }}>{card.front}</div>
          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 24, textAlign: 'center',
            fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500,
            background: 'rgba(255,255,255,0.75)',
            border: '1.5px solid rgba(0,0,0,0.1)',
            color: p.title, transform: 'rotateY(180deg)',
            whiteSpace: 'pre-line',
          }}>{card.back}</div>
        </div>
      </div>

      <div style={{
        fontFamily: 'Space Mono, monospace', fontSize: '0.62rem',
        color: p.muted, marginTop: 12, opacity: 0.65,
      }}>
        {flipped ? '✓ Respuesta revelada' : 'Toca para revelar la respuesta'}
      </div>
    </CardShell>
  )
}
