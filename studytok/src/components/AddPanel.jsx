import { useState, useRef } from 'react'
import { PALETTE, TYPE_LABEL } from '../data/defaults'

const TYPE_COLORS = {
  concept: { a:'#7c3aed', bg:'#f5f0ff' },
  quiz:    { a:'#be185d', bg:'#fff0f7' },
  fact:    { a:'#047857', bg:'#f0fdf8' },
  memory:  { a:'#b45309', bg:'#fffbeb' },
}

export default function AddPanel({ onClose, onSave, onSaveMany, showToast }) {
  const [tab, setTab] = useState('ai')
  const [type, setType] = useState('concept')
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [question, setQuestion] = useState('')
  const [opts, setOpts] = useState(['','','',''])
  const [correctIdx, setCorrectIdx] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [cardCount, setCardCount] = useState(3)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiCards, setAiCards] = useState([])
  const fileRef = useRef(null)

  const inp = { width:'100%', background:'#fff', border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'10px 13px', color:'#1e1b4b', fontFamily:'Nunito,sans-serif', fontSize:'0.88rem', outline:'none', resize:'none' }
  const lbl = { display:'block', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'#6b7280', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }

  async function handleFile(file) {
    if (!file) return
    setLoadingPDF(true); setPdfName(file.name)
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let text = ''
        for (let p = 1; p <= Math.min(pdf.numPages, 20); p++) {
          const page = await pdf.getPage(p)
          const content = await page.getTextContent()
          text += content.items.map(i => i.str).join(' ') + '\n'
        }
        setSourceText(text.slice(0, 4000))
      } else {
        setSourceText(await file.text())
      }
      setPdfName(file.name + ' ✓')
    } catch(e) { showToast('❌','Error al leer PDF', e.message); setPdfName('') }
    setLoadingPDF(false)
  }

  async function generate() {
    if (!sourceText.trim()) { showToast('⚠️','Falta texto',''); return }
    setLoadingAI(true); setAiCards([])
    try {
      const res = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ text:sourceText, count:cardCount, mode:'cards' }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiCards(data.cards || [])
    } catch(e) { showToast('❌','Error de IA', e.message) }
    setLoadingAI(false)
  }

  function fillForm(card) {
    setType(card.type); setSubject(card.subject||''); setTitle(card.title||'')
    if (card.body) setBody(card.body)
    if (card.question) setQuestion(card.question)
    if (card.options) { setOpts(card.options.map(o=>o.text).concat(['','','','']).slice(0,4)); setCorrectIdx(card.options.findIndex(o=>o.correct)) }
    if (card.explanation) setExplanation(card.explanation)
    if (card.front) setFront(card.front)
    if (card.back) setBack(card.back)
    setTab('manual'); setAiCards([])
  }

  function save() {
    if (!subject.trim()||!title.trim()) { showToast('⚠️','Falta materia o título',''); return }
    let card = {type, subject:subject.trim(), title:title.trim()}
    if (type==='concept'||type==='fact') {
      if (!body.trim()) { showToast('⚠️','Falta el contenido',''); return }
      card.body = body.trim()
    } else if (type==='quiz') {
      if (!question.trim()) { showToast('⚠️','Falta la pregunta',''); return }
      if (correctIdx===null) { showToast('⚠️','Marca la respuesta correcta',''); return }
      const options = opts.map((t,i)=>({text:t.trim(),correct:i===correctIdx})).filter(o=>o.text)
      if (options.length<2) { showToast('⚠️','Mínimo 2 opciones',''); return }
      card.question=question.trim(); card.options=options; card.explanation=explanation.trim()
    } else if (type==='memory') {
      if (!front.trim()||!back.trim()) { showToast('⚠️','Completa frente y reverso',''); return }
      card.front=front.trim(); card.back=back.trim()
    }
    onSave(card); onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)'}}/>
      <div style={{position:'relative',width:'100%',background:'#fafafa',borderRadius:'24px 24px 0 0',padding:'24px 22px 36px',borderTop:'1px solid rgba(0,0,0,0.07)',maxHeight:'90dvh',overflowY:'auto',boxShadow:'0 -8px 40px rgba(0,0,0,0.15)'}}>
        <button onClick={onClose} style={{position:'absolute',top:16,right:18,background:'rgba(0,0,0,0.06)',border:'none',color:'#6b7280',fontSize:'1rem',width:32,height:32,borderRadius:'50%',cursor:'pointer'}}>✕</button>
        <div style={{fontWeight:900,fontSize:'1.05rem',color:'#1e1b4b',marginBottom:4}}>Nueva tarjeta ✏️</div>
        <div style={{fontSize:'0.8rem',color:'#6b7280',marginBottom:18}}>Desde PDF con IA o crea manualmente</div>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {[['ai','✨ Desde PDF / IA'],['manual','✏️ Manual']].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'9px',borderRadius:12,cursor:'pointer',fontFamily:'inherit',fontSize:'0.85rem',fontWeight:700,border:`1.5px solid ${tab===t?'rgba(124,58,237,0.4)':'rgba(0,0,0,0.1)'}`,background:tab===t?'rgba(124,58,237,0.1)':'#fff',color:tab===t?'#6d28d9':'#6b7280'}}>{label}</button>
          ))}
        </div>

        {tab==='ai' && (
          <div>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
            <div onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0])}} style={{border:'2px dashed rgba(124,58,237,0.35)',borderRadius:16,padding:'20px 16px',textAlign:'center',cursor:'pointer',marginBottom:14,background:pdfName?'rgba(124,58,237,0.06)':'transparent'}}>
              {loadingPDF ? <div style={{color:'#7c3aed',fontWeight:700}}>Procesando PDF...</div>
              : pdfName ? <><div style={{fontSize:'1.8rem',marginBottom:4}}>📄</div><div style={{color:'#7c3aed',fontSize:'0.85rem',fontWeight:700}}>{pdfName}</div><div style={{color:'#9ca3af',fontSize:'0.72rem',marginTop:3}}>Toca para cambiar</div></>
              : <><div style={{fontSize:'2rem',marginBottom:6}}>📎</div><div style={{color:'#7c3aed',fontSize:'0.88rem',fontWeight:700}}>Subir PDF o .txt</div><div style={{color:'#9ca3af',fontSize:'0.72rem',marginTop:3}}>o arrastra aquí</div></>}
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>O pega texto / apuntes</label><textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="Pega apuntes, definición, artículo de ley..." style={{...inp,minHeight:80}}/></div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <span style={{...lbl,marginBottom:0,flexShrink:0}}>Tarjetas:</span>
              <div style={{display:'flex',gap:6}}>{[1,3,5,8].map(n=><button key={n} onClick={()=>setCardCount(n)} style={{width:36,height:36,borderRadius:10,cursor:'pointer',fontFamily:'Space Mono,monospace',fontSize:'0.8rem',fontWeight:700,background:cardCount===n?'rgba(124,58,237,0.12)':'#fff',border:`1.5px solid ${cardCount===n?'#7c3aed':'rgba(0,0,0,0.1)'}`,color:cardCount===n?'#6d28d9':'#6b7280'}}>{n}</button>)}</div>
            </div>
            <button onClick={generate} disabled={loadingAI||!sourceText.trim()} style={{width:'100%',padding:'12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#7c3aed,#be185d)',color:'#fff',fontFamily:'inherit',fontWeight:900,fontSize:'0.9rem',cursor:loadingAI||!sourceText.trim()?'not-allowed':'pointer',opacity:loadingAI||!sourceText.trim()?0.5:1}}>
              {loadingAI?'Generando...':`Generar ${cardCount} tarjeta${cardCount>1?'s':''} ⚡`}
            </button>
            {aiCards.length>0 && (
              <div style={{marginTop:18}}>
                <div style={{...lbl,marginBottom:10}}>Toca una para editarla, o guarda todas</div>
                {aiCards.map((c,i)=>{
                  const p=PALETTE[c.type]||PALETTE.concept
                  return <div key={i} onClick={()=>fillForm(c)} style={{background:p.badge,border:`1.5px solid ${p.badgeBorder}`,borderRadius:12,padding:'12px 14px',marginBottom:8,cursor:'pointer'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}><span style={{fontFamily:'Space Mono,monospace',fontSize:'0.6rem',color:p.badgeText,background:p.badge,border:`1px solid ${p.badgeBorder}`,padding:'2px 8px',borderRadius:20}}>{TYPE_LABEL[c.type]||c.type}</span><span style={{fontFamily:'Space Mono,monospace',fontSize:'0.6rem',color:'#9ca3af'}}>{c.subject}</span></div>
                    <div style={{fontWeight:700,fontSize:'0.88rem',color:p.title,marginBottom:3}}>{c.title}</div>
                    <div style={{fontSize:'0.78rem',color:p.body,lineHeight:1.5,opacity:0.8}}>{(c.body||c.question||c.front||'').slice(0,100)}...</div>
                    <div style={{fontSize:'0.72rem',color:p.accent,fontWeight:700,marginTop:6}}>Editar y guardar →</div>
                  </div>
                })}
                <button onClick={()=>{onSaveMany(aiCards);setAiCards([]);onClose()}} style={{width:'100%',padding:'11px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#7c3aed,#be185d)',color:'#fff',fontFamily:'inherit',fontWeight:900,fontSize:'0.88rem',cursor:'pointer'}}>
                  Guardar todas ({aiCards.length}) ✓
                </button>
              </div>
            )}
          </div>
        )}

        {tab==='manual' && (
          <div>
            <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
              {Object.keys(TYPE_LABEL).map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{fontFamily:'Space Mono,monospace',fontSize:'0.6rem',letterSpacing:'0.08em',textTransform:'uppercase',padding:'6px 12px',borderRadius:20,cursor:'pointer',background:type===t?TYPE_COLORS[t].bg:'#fff',border:`1.5px solid ${type===t?TYPE_COLORS[t].a:'rgba(0,0,0,0.1)'}`,color:type===t?TYPE_COLORS[t].a:'#6b7280',fontWeight:type===t?700:400}}>{TYPE_LABEL[t]}</button>
              ))}
            </div>
            <div style={{marginBottom:12}}><label style={lbl}>Materia</label><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Ej: Derecho Tributario" style={inp}/></div>
            <div style={{marginBottom:12}}><label style={lbl}>Título</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título de la tarjeta" style={inp}/></div>
            {(type==='concept'||type==='fact')&&<div style={{marginBottom:12}}><label style={lbl}>Contenido</label><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Explica el concepto..." style={{...inp,minHeight:80}}/></div>}
            {type==='quiz'&&<>
              <div style={{marginBottom:12}}><label style={lbl}>Pregunta</label><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="¿Cuál es...?" style={inp}/></div>
              <div style={{marginBottom:12}}><label style={lbl}>Opciones — marca la correcta</label>
                {opts.map((o,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}><input type="radio" name="correct" checked={correctIdx===i} onChange={()=>setCorrectIdx(i)} style={{accentColor:'#be185d',width:16,height:16,flexShrink:0}}/><span style={{fontFamily:'Space Mono,monospace',fontSize:'0.6rem',color:'#9ca3af'}}>{String.fromCharCode(65+i)}</span><input value={o} onChange={e=>{const n=[...opts];n[i]=e.target.value;setOpts(n)}} placeholder={`Opción ${String.fromCharCode(65+i)}${i>1?' (opcional)':''}`} style={{...inp,flex:1,padding:'9px 11px'}}/></div>)}
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Explicación (si fallan)</label><textarea value={explanation} onChange={e=>setExplanation(e.target.value)} placeholder="¿Por qué es correcta?" style={{...inp,minHeight:60}}/></div>
            </>}
            {type==='memory'&&<>
              <div style={{marginBottom:12}}><label style={lbl}>Pregunta / Frente</label><textarea value={front} onChange={e=>setFront(e.target.value)} placeholder="Pregunta al frente" style={{...inp,minHeight:65}}/></div>
              <div style={{marginBottom:12}}><label style={lbl}>Respuesta / Reverso</label><textarea value={back} onChange={e=>setBack(e.target.value)} placeholder="Respuesta al girar" style={{...inp,minHeight:65}}/></div>
            </>}
            <button onClick={save} style={{width:'100%',padding:'14px',border:'none',borderRadius:14,background:'linear-gradient(135deg,#7c3aed,#be185d)',color:'#fff',fontWeight:900,fontSize:'0.9rem',cursor:'pointer',boxShadow:'0 4px 20px rgba(124,58,237,0.28)'}}>Guardar tarjeta ✓</button>
          </div>
        )}
      </div>
    </div>
  )
}
