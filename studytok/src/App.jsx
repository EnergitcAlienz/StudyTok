import { useState, useRef } from 'react'
import { PALETTE } from './data/defaults'
import { useCards } from './hooks/useCards'
import { CardRouter } from './components/Cards'
import AddPanel from './components/AddPanel'
import ExplainPanel from './components/ExplainPanel'
import ChatAssistant from './components/ChatAssistant'
import Toast from './components/Toast'
import Particles from './components/Particles'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const COLOR_MAP = {
  purple: { bg:'#f5f0ff', blob1:'rgba(221,214,254,0.9)', blob2:'rgba(196,181,253,0.6)', stripe:'linear-gradient(90deg,transparent,#c4b5fd 40%,#a78bfa 60%,transparent)', accent:'#7c3aed' },
  pink:   { bg:'#fff0f7', blob1:'rgba(251,207,232,0.95)', blob2:'rgba(249,168,212,0.6)', stripe:'linear-gradient(90deg,transparent,#f9a8d4 40%,#f472b6 60%,transparent)', accent:'#be185d' },
  green:  { bg:'#f0fdf8', blob1:'rgba(209,250,229,0.95)', blob2:'rgba(167,243,208,0.6)', stripe:'linear-gradient(90deg,transparent,#6ee7b7 40%,#34d399 60%,transparent)', accent:'#047857' },
  yellow: { bg:'#fffbeb', blob1:'rgba(254,243,199,0.98)', blob2:'rgba(252,211,77,0.5)', stripe:'linear-gradient(90deg,transparent,#fcd34d 40%,#fbbf24 60%,transparent)', accent:'#b45309' },
}

function getCurrentPalette(card) {
  if (card?.color && COLOR_MAP[card.color]) return COLOR_MAP[card.color]
  return PALETTE[card?.type] || PALETTE.concept
}

// ── Onboarding ─────────────────────────────────────────────────────
function Onboard({ onStart }) {
  return (
    <div style={{ minHeight:'100dvh', fontFamily:'Nunito,sans-serif', background:'linear-gradient(135deg,#f5f0ff 0%,#fff0f7 50%,#f0fdf8 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center', position:'relative', overflow:'hidden' }}>
      {[['rgba(196,181,253,0.65)','-8%','-5%','14s','0s'],['rgba(249,168,212,0.55)','auto','-5%','11s','-4s'],['rgba(167,243,208,0.5)','42%','25%','17s','-8s']].map(([bg,top,right,dur,delay],i)=>(
        <div key={i} style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:bg, filter:'blur(65px)', top, right, bottom:top==='auto'?'-5%':undefined, animation:`drift ${dur} ease-in-out infinite alternate`, animationDelay:delay, pointerEvents:'none' }}/>
      ))}
      <div style={{ fontSize:'clamp(2.4rem,8vw,3.8rem)', fontWeight:900, letterSpacing:'-0.05em', marginBottom:8, position:'relative', background:'linear-gradient(135deg,#7c3aed 0%,#be185d 50%,#047857 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'200% 200%', animation:'gradient-shift 4s ease infinite' }}>
        StudyTok 🌸
      </div>
      <div style={{ color:'#6b7280', fontSize:'0.95rem', lineHeight:1.7, maxWidth:340, marginBottom:28, position:'relative' }}>
        El scroll adictivo del feed, pero para aprender de verdad.
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:340, marginBottom:28, position:'relative' }}>
        {[['👆','Desliza hacia arriba para avanzar'],['📎','Sube tu PDF y genera tarjetas con IA'],['🧠','Modo "Explícame" — aprende con historias, analogías y diagramas'],['🤖','Asistente de IA para investigar temas'],['🔥','Racha y XP para mantenerte enganchada']].map(([em,txt])=>(
          <div key={em} style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', border:'1px solid rgba(0,0,0,0.06)', borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, textAlign:'left', fontSize:'0.88rem', color:'#374151', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{em}</span>{txt}
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{ background:'linear-gradient(135deg,#7c3aed,#be185d)', backgroundSize:'200% 200%', animation:'gradient-shift 3s ease infinite', color:'#fff', fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:'1.05rem', padding:'15px 48px', border:'none', borderRadius:50, cursor:'pointer', boxShadow:'0 6px 28px rgba(124,58,237,0.4)' }}>
        Empezar ⚡
      </button>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('onboard')
  const { cards, addCard, addCards } = useCards()
  const [deck, setDeck] = useState([])
  const [idx, setIdx] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [answered, setAnswered] = useState({})
  const [toast, setToast] = useState({ show:false, emoji:'', text:'', sub:'' })
  const [particle, setParticle] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [showExplain, setShowExplain] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isAnim, setIsAnim] = useState(false)
  const touchY = useRef(0)
  const toastTimer = useRef(null)

  function start() { setDeck(shuffle(cards)); setIdx(0); setAnswered({}); setScreen('feed') }

  function showToast(emoji, text, sub='') {
    setToast({ show:true, emoji, text, sub })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t=>({...t,show:false})), 2000)
  }

  function goNext() { if (!isAnim&&idx<deck.length-1) { setIsAnim(true); setIdx(i=>i+1); setTimeout(()=>setIsAnim(false),420) } }
  function goPrev() { if (!isAnim&&idx>0) { setIsAnim(true); setIdx(i=>i-1); setTimeout(()=>setIsAnim(false),420) } }

  function handleAnswer(ci, oi) {
    if (answered[`${ci}-done`]) return
    const card = deck[ci]
    const correct = card.options[oi].correct
    const update = { [`${ci}-done`]:true, [`${ci}-${oi}`]:correct?'correct':'wrong' }
    if (!correct) {
      card.options.forEach((_,i)=>{ if(card.options[i].correct) update[`${ci}-${i}`]='correct' })
      update[`${ci}-exp`]=true; setStreak(0); showToast('😅','¡Casi!','Revisa la explicación')
    } else {
      const pts=10+streak*2; setXp(x=>x+pts); setStreak(s=>s+1); setParticle(p=>p+1)
      showToast('🎉','¡Correcto!',`+${pts} XP · Racha ${streak+1}🔥`)
    }
    setAnswered(a=>({...a,...update}))
  }

  function handleSaveCard(card) { addCard(card); setDeck(prev=>[...prev,card]); showToast('🃏','¡Tarjeta guardada!','') }
  function handleSaveMany(newCards) { addCards(newCards); setDeck(prev=>[...prev,...newCards]); showToast('🎉',`${newCards.length} slides añadidos!`,'Desliza para verlos') }

  const current = deck[idx]
  const p = getCurrentPalette(current)
  const pct = deck.length ? ((idx+1)/deck.length*100).toFixed(0) : 0

  if (screen==='onboard') return <Onboard onStart={start} />

  return (
    <div style={{ height:'100dvh', background:p.bg, fontFamily:'Nunito,sans-serif', overflow:'hidden', position:'relative', userSelect:'none', transition:'background 0.5s' }}
      onTouchStart={e=>{ touchY.current=e.touches[0].clientY }}
      onTouchEnd={e=>{ const dy=touchY.current-e.changedTouches[0].clientY; if(Math.abs(dy)>50) dy>0?goNext():goPrev() }}>

      {/* Top stripe */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:p.stripe, zIndex:10, transition:'background 0.4s' }}/>

      {/* HUD */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:`linear-gradient(to bottom,${p.bg}f0,${p.bg}00)`, transition:'background 0.5s' }}>
        <div style={{ fontWeight:900, fontSize:'1rem', background:'linear-gradient(135deg,#7c3aed,#be185d)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>StudyTok 🌸</div>
        <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap', justifyContent:'flex-end' }}>
          <button onClick={()=>setShowExplain(true)} style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(190,24,93,0.15))', border:'1.5px solid rgba(124,58,237,0.3)', borderRadius:20, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', fontSize:'0.8rem', fontWeight:700, color:'#6d28d9' }}>🧠 Explícame</button>
          <button onClick={()=>setShowChat(true)} style={{ background:'rgba(255,255,255,0.8)', border:'1.5px solid rgba(0,0,0,0.08)', borderRadius:20, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', fontSize:'0.8rem', fontWeight:700, color:'#374151' }}>🤖 Asistente</button>
          <div style={{ background:'rgba(255,255,255,0.8)', border:'1.5px solid rgba(0,0,0,0.08)', borderRadius:20, padding:'3px 10px', fontFamily:'Space Mono,monospace', fontSize:'0.7rem', fontWeight:700, color:'#92400e', display:'flex', alignItems:'center', gap:4 }}>🔥 <b>{streak}</b></div>
          <div style={{ background:'rgba(255,255,255,0.8)', border:'1.5px solid rgba(0,0,0,0.08)', borderRadius:20, padding:'3px 10px', fontFamily:'Space Mono,monospace', fontSize:'0.7rem', fontWeight:700, color:'#374151' }}>⭐ {xp}</div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ position:'relative', height:'100dvh', zIndex:1 }}>
        {deck.length===0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:14, textAlign:'center', padding:32 }}>
            <div style={{ fontSize:'3rem' }}>📭</div>
            <div style={{ fontWeight:900, fontSize:'1.2rem', color:'#4c1d95' }}>Sin tarjetas aún</div>
            <div style={{ fontSize:'0.9rem', color:'#6b7280', maxWidth:280, lineHeight:1.6 }}>Toca <b>🧠 Explícame</b> para generar slides desde un tema o PDF, o usa <b>＋</b> para agregar tarjetas</div>
          </div>
        ) : deck.map((card, i) => {
          const pos = i<idx?'above':i===idx?'active':'below'
          return <CardRouter key={i} card={card} pos={pos} cardIdx={i} answered={answered} onAnswer={handleAnswer} onFlip={()=>setXp(x=>x+5)} />
        })}
      </div>

      {/* Wheel nav */}
      <div style={{ position:'fixed', inset:0, zIndex:2, pointerEvents:'none' }} onWheel={e=>{ e.stopPropagation(); e.deltaY>0?goNext():goPrev() }}/>

      {/* Bottom HUD */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, padding:'12px 20px 26px', background:`linear-gradient(to top,${p.bg}f8 60%,${p.bg}00)`, display:'flex', alignItems:'center', gap:12, transition:'background 0.5s' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'#9ca3af', marginBottom:6 }}>
            {deck.length ? `${idx+1} / ${deck.length} tarjetas` : '0 tarjetas'}
          </div>
          <div style={{ height:5, background:'rgba(0,0,0,0.08)', borderRadius:5, overflow:'hidden' }}>
            <div style={{ height:'100%', width:pct+'%', borderRadius:5, background:`linear-gradient(90deg,${p.accent},#be185d)`, transition:'width 0.4s ease,background 0.5s' }}/>
          </div>
        </div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'#9ca3af', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          <span style={{ animation:'bob 1.4s infinite', display:'inline-block' }}>↑</span> desliza
        </div>
        <button onClick={()=>setShowAdd(true)} style={{ width:46, height:46, borderRadius:'50%', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, background:'linear-gradient(135deg,#7c3aed,#be185d)', boxShadow:'0 4px 18px rgba(124,58,237,0.4)', color:'#fff' }}>＋</button>
      </div>

      <Toast toast={toast}/>
      <Particles trigger={particle}/>
      {showAdd && <AddPanel onClose={()=>setShowAdd(false)} onSave={handleSaveCard} onSaveMany={handleSaveMany} showToast={showToast}/>}
      {showExplain && <ExplainPanel onClose={()=>setShowExplain(false)} onSaveCards={handleSaveMany} showToast={showToast}/>}
      {showChat && <ChatAssistant onClose={()=>setShowChat(false)} onSaveCards={handleSaveMany} showToast={showToast}/>}
    </div>
  )
}
