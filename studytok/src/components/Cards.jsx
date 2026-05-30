import { useState } from 'react'
import { PALETTE, TYPE_LABEL } from '../data/defaults'

const COLOR_MAP = {
  purple: { bg:'#f5f0ff', grad:'radial-gradient(ellipse 70% 55% at 70% 15%,rgba(221,214,254,0.95),#f5f0ff)', blob1:'rgba(221,214,254,0.9)', blob2:'rgba(196,181,253,0.6)', accent:'#7c3aed', title:'#4c1d95', body:'#5b21b6', stripe:'linear-gradient(90deg,transparent,#c4b5fd 40%,#a78bfa 60%,transparent)', badge:'rgba(124,58,237,0.12)', badgeBorder:'rgba(124,58,237,0.35)', badgeText:'#6d28d9' },
  pink:   { bg:'#fff0f7', grad:'radial-gradient(ellipse 70% 55% at 30% 20%,rgba(251,207,232,0.95),#fff0f7)', blob1:'rgba(251,207,232,0.95)', blob2:'rgba(249,168,212,0.6)', accent:'#be185d', title:'#831843', body:'#9d174d', stripe:'linear-gradient(90deg,transparent,#f9a8d4 40%,#f472b6 60%,transparent)', badge:'rgba(190,24,93,0.12)', badgeBorder:'rgba(190,24,93,0.35)', badgeText:'#9d174d' },
  green:  { bg:'#f0fdf8', grad:'radial-gradient(ellipse 70% 55% at 65% 10%,rgba(209,250,229,0.95),#f0fdf8)', blob1:'rgba(209,250,229,0.95)', blob2:'rgba(167,243,208,0.6)', accent:'#047857', title:'#064e3b', body:'#065f46', stripe:'linear-gradient(90deg,transparent,#6ee7b7 40%,#34d399 60%,transparent)', badge:'rgba(4,120,87,0.12)', badgeBorder:'rgba(4,120,87,0.35)', badgeText:'#065f46' },
  yellow: { bg:'#fffbeb', grad:'radial-gradient(ellipse 70% 55% at 50% 10%,rgba(254,243,199,0.95),#fffbeb)', blob1:'rgba(254,243,199,0.98)', blob2:'rgba(252,211,77,0.5)', accent:'#b45309', title:'#78350f', body:'#92400e', stripe:'linear-gradient(90deg,transparent,#fcd34d 40%,#fbbf24 60%,transparent)', badge:'rgba(180,83,9,0.12)', badgeBorder:'rgba(180,83,9,0.35)', badgeText:'#92400e' },
}

function getP(card) {
  if (card.color && COLOR_MAP[card.color]) return COLOR_MAP[card.color]
  return PALETTE[card.type] || PALETTE.concept
}

// ── Animated background blobs ──────────────────────────────────────
function Blobs({ p }) {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', background:p.blob1, filter:'blur(65px)', top:'-10%', left:'-8%', animation:'drift 14s ease-in-out infinite alternate', transition:'background 0.6s' }} />
      <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:p.blob2, filter:'blur(55px)', bottom:'-8%', right:'-6%', animation:'drift 11s ease-in-out infinite alternate', animationDelay:'-4s', transition:'background 0.6s' }} />
      <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:p.blob1, filter:'blur(40px)', top:'40%', right:'10%', animation:'drift 16s ease-in-out infinite alternate', animationDelay:'-8s', opacity:0.5 }} />
    </div>
  )
}

// ── Floating decorative shapes ─────────────────────────────────────
function FloatingShapes({ p, emoji }) {
  const shapes = [
    { size:60, top:'12%', right:'8%', delay:'0s', dur:'6s' },
    { size:40, top:'70%', left:'5%', delay:'2s', dur:'8s' },
    { size:30, top:'30%', left:'12%', delay:'4s', dur:'7s' },
  ]
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}>
      {shapes.map((s, i) => (
        <div key={i} style={{
          position:'absolute', width:s.size, height:s.size, borderRadius:'50%',
          background:`${p.badge}`, border:`1.5px solid ${p.badgeBorder}`,
          top:s.top, left:s.left, right:s.right,
          animation:`bob ${s.dur} ease-in-out infinite`,
          animationDelay:s.delay, opacity:0.6,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: s.size * 0.45,
        }}>
          {i === 0 ? emoji || '✨' : i === 1 ? '⭐' : '💫'}
        </div>
      ))}
    </div>
  )
}

// ── Badge + subject header ─────────────────────────────────────────
function CardHeader({ card, p, label }) {
  return (
    <>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:p.stripe, zIndex:10 }} />
      <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 12px', borderRadius:20, marginBottom:12, background:p.badge, border:`1.5px solid ${p.badgeBorder}`, color:p.badgeText, position:'relative', zIndex:2 }}>
        {label || TYPE_LABEL[card.type] || card.type}
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:p.body, marginBottom:10, letterSpacing:'0.06em', opacity:0.6, position:'relative', zIndex:2 }}>
        {card.subject}
      </div>
    </>
  )
}

// ── Shell wrapper ──────────────────────────────────────────────────
function Shell({ card, pos, children, p: pOverride }) {
  const p = pOverride || getP(card)
  const transforms = { below:'translateY(100%)', above:'translateY(-100%)', active:'translateY(0)' }
  return (
    <div style={{
      position:'absolute', inset:0,
      display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
      padding:'80px 22px 110px',
      background: p.grad,
      transform: transforms[pos],
      opacity: pos === 'above' ? 0 : 1,
      transition:'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s',
      overflow:'hidden',
    }}>
      <Blobs p={p} />
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// CLASSIC CARDS
// ══════════════════════════════════════════════════════════════════

export function ConceptCard({ card, pos }) {
  const p = getP(card)
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '📖'} />
      <CardHeader card={card} p={p} />
      {/* Big emoji */}
      <div style={{ fontSize:'4rem', marginBottom:16, position:'relative', zIndex:2, animation:'bob 3s ease-in-out infinite' }}>
        {card.emoji || '📖'}
      </div>
      <div style={{ fontSize:'clamp(1.25rem,4.5vw,1.85rem)', fontWeight:900, textAlign:'center', marginBottom:14, lineHeight:1.2, color:p.title, position:'relative', zIndex:2 }}>
        {card.title}
      </div>
      <div style={{ fontSize:'clamp(0.9rem,2.8vw,1.05rem)', color:p.body, textAlign:'center', lineHeight:1.75, maxWidth:500, opacity:0.88, position:'relative', zIndex:2 }}>
        {card.body}
      </div>
    </Shell>
  )
}

export function QuizCard({ card, pos, cardIdx, answered, onAnswer }) {
  const p = getP(card)
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '❓'} />
      <CardHeader card={card} p={p} />
      <div style={{ fontSize:'3.5rem', marginBottom:12, position:'relative', zIndex:2, animation:'bob 2.5s ease-in-out infinite' }}>
        {card.emoji || '❓'}
      </div>
      <div style={{ fontSize:'clamp(1.1rem,4vw,1.6rem)', fontWeight:900, textAlign:'center', marginBottom:10, lineHeight:1.2, color:p.title, position:'relative', zIndex:2 }}>
        {card.title}
      </div>
      <div style={{ fontSize:'0.9rem', color:p.body, textAlign:'center', marginBottom:16, lineHeight:1.65, maxWidth:460, opacity:0.85, position:'relative', zIndex:2 }}>
        {card.question}
      </div>
      <div style={{ width:'100%', maxWidth:480, display:'flex', flexDirection:'column', gap:9, position:'relative', zIndex:2 }}>
        {card.options?.map((opt, oi) => {
          const state = answered[`${cardIdx}-${oi}`]
          return (
            <button key={oi} onClick={() => onAnswer(cardIdx, oi)} style={{
              padding:'12px 16px', borderRadius:14, fontFamily:'Nunito,sans-serif', fontSize:'0.88rem',
              textAlign:'left', cursor:answered[`${cardIdx}-done`] ? 'default' : 'pointer',
              transition:'all 0.18s', fontWeight:state ? 700 : 500,
              background: state==='correct' ? 'rgba(52,211,153,0.2)' : state==='wrong' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.6)',
              border:`1.5px solid ${state==='correct' ? '#059669' : state==='wrong' ? '#ef4444' : p.badgeBorder}`,
              color: state==='correct' ? '#065f46' : state==='wrong' ? '#991b1b' : p.body,
              backdropFilter:'blur(8px)',
            }}>{opt.text}</button>
          )
        })}
      </div>
      {answered[`${cardIdx}-exp`] && card.explanation && (
        <div style={{ marginTop:14, background:'rgba(255,255,255,0.6)', backdropFilter:'blur(8px)', border:'1px solid rgba(0,0,0,0.08)', borderRadius:12, padding:'12px 15px', fontSize:'0.82rem', color:p.body, lineHeight:1.65, maxWidth:480, textAlign:'left', position:'relative', zIndex:2 }}>
          💡 {card.explanation}
        </div>
      )}
    </Shell>
  )
}

export function MemoryCard({ card, pos, onFlip }) {
  const [flipped, setFlipped] = useState(false)
  const p = getP(card)
  function handleFlip() { setFlipped(f => !f); if (!flipped) onFlip?.() }
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '🃏'} />
      <CardHeader card={card} p={p} />
      <div style={{ fontSize:'3.5rem', marginBottom:12, position:'relative', zIndex:2, animation:'bob 3s ease-in-out infinite' }}>
        {card.emoji || '🃏'}
      </div>
      <div style={{ fontSize:'clamp(1.1rem,4vw,1.6rem)', fontWeight:900, textAlign:'center', marginBottom:10, color:p.title, position:'relative', zIndex:2 }}>
        Tarjeta de memoria
      </div>
      <div onClick={handleFlip} style={{ width:'100%', maxWidth:420, height:180, perspective:1000, cursor:'pointer', marginTop:8, position:'relative', zIndex:2 }}>
        <div style={{ width:'100%', height:'100%', position:'relative', transformStyle:'preserve-3d', transition:'transform 0.55s cubic-bezier(0.4,0,0.2,1)', transform:flipped ? 'rotateY(180deg)' : 'none' }}>
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center', fontSize:'1rem', lineHeight:1.55, fontWeight:600, background:`linear-gradient(135deg,${p.badge},rgba(255,255,255,0.4))`, border:`1.5px solid ${p.badgeBorder}`, color:p.title, backdropFilter:'blur(8px)' }}>
            {card.front}
          </div>
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center', fontSize:'0.95rem', lineHeight:1.6, fontWeight:500, background:'rgba(255,255,255,0.75)', border:'1.5px solid rgba(0,0,0,0.1)', color:p.title, transform:'rotateY(180deg)', whiteSpace:'pre-line', backdropFilter:'blur(8px)' }}>
            {card.back}
          </div>
        </div>
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:p.muted || p.body, marginTop:12, opacity:0.65, position:'relative', zIndex:2 }}>
        {flipped ? '✓ Respuesta revelada' : 'Toca para revelar la respuesta'}
      </div>
    </Shell>
  )
}

// ══════════════════════════════════════════════════════════════════
// EXPLAIN MODE CARDS — más visuales y didácticas
// ══════════════════════════════════════════════════════════════════

// Story card — narrativa
export function StoryCard({ card, pos }) {
  const p = COLOR_MAP[card.color] || COLOR_MAP.purple
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '🎭'} />
      <CardHeader card={card} p={p} label="🎭 Historia" />
      <div style={{ fontSize:'5rem', marginBottom:8, position:'relative', zIndex:2, animation:'bob 3s ease-in-out infinite', filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
        {card.emoji || '🎭'}
      </div>
      <div style={{ fontSize:'clamp(1.25rem,4.5vw,1.8rem)', fontWeight:900, textAlign:'center', marginBottom:16, lineHeight:1.2, color:p.title, position:'relative', zIndex:2 }}>
        {card.title}
      </div>
      <div style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(12px)', borderRadius:20, padding:'18px 22px', maxWidth:500, position:'relative', zIndex:2, border:`1.5px solid ${p.badgeBorder}`, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:'1.5rem', marginBottom:8 }}>📖</div>
        <div style={{ fontSize:'clamp(0.9rem,2.8vw,1rem)', color:p.body, lineHeight:1.8, fontStyle:'italic' }}>
          "{card.narrative}"
        </div>
      </div>
    </Shell>
  )
}

// Analogy card — comparación visual
export function AnalogyCard({ card, pos }) {
  const p = COLOR_MAP[card.color] || COLOR_MAP.pink
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '⚖️'} />
      <CardHeader card={card} p={p} label="⚖️ Analogía" />
      <div style={{ fontSize:'4rem', marginBottom:8, position:'relative', zIndex:2, animation:'bob 3s ease-in-out infinite' }}>
        {card.emoji || '⚖️'}
      </div>
      <div style={{ fontSize:'clamp(1.2rem,4vw,1.7rem)', fontWeight:900, textAlign:'center', marginBottom:16, lineHeight:1.2, color:p.title, position:'relative', zIndex:2 }}>
        {card.title}
      </div>
      {/* Two-column comparison */}
      <div style={{ display:'flex', gap:10, width:'100%', maxWidth:480, position:'relative', zIndex:2, marginBottom:14 }}>
        <div style={{ flex:1, background:'rgba(255,255,255,0.65)', backdropFilter:'blur(12px)', borderRadius:16, padding:'14px 12px', textAlign:'center', border:`1.5px solid ${p.badgeBorder}` }}>
          <div style={{ fontSize:'1.8rem', marginBottom:6 }}>⚖️</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:p.badgeText, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Concepto legal</div>
          <div style={{ fontSize:'0.85rem', fontWeight:700, color:p.title, lineHeight:1.4 }}>{card.left}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', fontSize:'1.5rem', flexShrink:0 }}>🟰</div>
        <div style={{ flex:1, background:'rgba(255,255,255,0.65)', backdropFilter:'blur(12px)', borderRadius:16, padding:'14px 12px', textAlign:'center', border:`1.5px solid ${p.badgeBorder}` }}>
          <div style={{ fontSize:'1.8rem', marginBottom:6 }}>🌍</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:p.badgeText, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>En la vida real</div>
          <div style={{ fontSize:'0.85rem', fontWeight:700, color:p.title, lineHeight:1.4 }}>{card.right}</div>
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.55)', backdropFilter:'blur(8px)', borderRadius:14, padding:'12px 16px', maxWidth:480, position:'relative', zIndex:2, border:`1px solid ${p.badgeBorder}` }}>
        <div style={{ fontSize:'0.88rem', color:p.body, lineHeight:1.7, textAlign:'center' }}>{card.comparison}</div>
      </div>
    </Shell>
  )
}

// Visual / bullet points card
export function VisualCard({ card, pos }) {
  const p = COLOR_MAP[card.color] || COLOR_MAP.green
  const icons = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣']
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '✨'} />
      <CardHeader card={card} p={p} label={`${card.icon || '📋'} Visual`} />
      <div style={{ fontSize:'4.5rem', marginBottom:8, position:'relative', zIndex:2, animation:'bob 3.5s ease-in-out infinite' }}>
        {card.icon || card.emoji || '📋'}
      </div>
      <div style={{ fontSize:'clamp(1.2rem,4vw,1.7rem)', fontWeight:900, textAlign:'center', marginBottom:16, lineHeight:1.2, color:p.title, position:'relative', zIndex:2 }}>
        {card.title}
      </div>
      <div style={{ width:'100%', maxWidth:480, display:'flex', flexDirection:'column', gap:9, position:'relative', zIndex:2 }}>
        {card.points?.map((point, i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(8px)', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, border:`1.5px solid ${p.badgeBorder}`, animation:`card-in 0.4s ease ${i * 0.1}s both` }}>
            <span style={{ fontSize:'1.4rem', flexShrink:0 }}>{icons[i] || '▸'}</span>
            <span style={{ fontSize:'0.9rem', color:p.body, fontWeight:600, lineHeight:1.4 }}>{point}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

// Fact card with highlight
export function FactCard({ card, pos }) {
  const p = COLOR_MAP[card.color] || COLOR_MAP.yellow
  return (
    <Shell card={card} pos={pos} p={p}>
      <FloatingShapes p={p} emoji={card.emoji || '⚡'} />
      <CardHeader card={card} p={p} label="⚡ Dato clave" />
      <div style={{ fontSize:'5rem', marginBottom:8, position:'relative', zIndex:2, animation:'bob 2.8s ease-in-out infinite', filter:'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }}>
        {card.emoji || '⚡'}
      </div>
      <div style={{ fontSize:'clamp(1.25rem,4.5vw,1.85rem)', fontWeight:900, textAlign:'center', marginBottom:14, lineHeight:1.2, color:p.title, position:'relative', zIndex:2 }}>
        {card.title}
      </div>
      <div style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(12px)', borderRadius:20, padding:'18px 22px', maxWidth:500, position:'relative', zIndex:2, border:`1.5px solid ${p.badgeBorder}`, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', width:'100%' }}>
        <div style={{ fontSize:'clamp(0.9rem,2.8vw,1rem)', color:p.body, lineHeight:1.8, marginBottom: card.highlight ? 14 : 0 }}>
          {card.body}
        </div>
        {card.highlight && (
          <div style={{ background:p.badge, border:`1.5px solid ${p.badgeBorder}`, borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
            <span style={{ fontWeight:900, fontSize:'0.9rem', color:p.badgeText }}>💡 {card.highlight}</span>
          </div>
        )}
      </div>
    </Shell>
  )
}

// ── Card router ────────────────────────────────────────────────────
export function CardRouter({ card, pos, cardIdx, answered, onAnswer, onFlip }) {
  const props = { card, pos, cardIdx, answered, onAnswer, onFlip }
  switch (card.type) {
    case 'story':   return <StoryCard {...props} />
    case 'analogy': return <AnalogyCard {...props} />
    case 'visual':  return <VisualCard {...props} />
    case 'fact':    return <FactCard {...props} />
    case 'quiz':    return <QuizCard {...props} />
    case 'memory':  return <MemoryCard {...props} />
    case 'concept': return <ConceptCard {...props} />
    default:        return <ConceptCard {...props} />
  }
}
