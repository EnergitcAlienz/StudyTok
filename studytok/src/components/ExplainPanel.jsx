import { useState, useRef } from 'react'

const STYLE_PRESETS = [
  { label:'📖 Como historia', value:'Explícamelo como una historia narrativa con personajes y situaciones cotidianas' },
  { label:'⚖️ Con analogías', value:'Usa analogías y comparaciones con situaciones de la vida diaria peruana' },
  { label:'🧩 Paso a paso', value:'Explícalo paso a paso de forma muy visual, como si fuera un cómic o guía visual' },
  { label:'🎓 Con ejemplos reales', value:'Usa ejemplos reales de jurisprudencia peruana, casos INDECOPI o situaciones cotidianas' },
  { label:'🤓 Para principiante', value:'Explícalo como si nunca hubiera estudiado el tema, con lenguaje simple y memorable' },
]

export default function ExplainPanel({ onClose, onSaveCards, showToast }) {
  const [topic, setTopic] = useState('')
  const [customStyle, setCustomStyle] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [pdfName, setPdfName] = useState('')
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(4)
  const fileRef = useRef(null)

  const finalStyle = selectedPreset !== null ? STYLE_PRESETS[selectedPreset].value : customStyle

  async function handleFile(file) {
    if (!file) return
    setLoadingPDF(true)
    setPdfName(file.name)
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
        setTopic(text.slice(0, 3000))
      } else {
        setTopic(await file.text())
      }
      setPdfName(file.name + ' ✓')
    } catch (e) {
      showToast('❌', 'Error al leer PDF', e.message)
      setPdfName('')
    }
    setLoadingPDF(false)
  }

  async function generate() {
    if (!topic.trim()) { showToast('⚠️', 'Escribe el tema o sube un PDF', ''); return }
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: topic, count, mode: 'explain', style: finalStyle }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onSaveCards(data.cards || [])
      showToast('🎉', `${(data.cards || []).length} slides generados!`, 'Desliza para verlos')
      onClose()
    } catch (e) {
      showToast('❌', 'Error', e.message)
    }
    setLoading(false)
  }

  const inp = { width:'100%', background:'#fff', border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'10px 13px', color:'#1e1b4b', fontFamily:'Nunito,sans-serif', fontSize:'0.88rem', outline:'none', resize:'none' }
  const lbl = { display:'block', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'#6b7280', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.25)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', width:'100%', background:'#fafafa', borderRadius:'24px 24px 0 0', padding:'24px 22px 36px', borderTop:'1px solid rgba(0,0,0,0.07)', maxHeight:'92dvh', overflowY:'auto', boxShadow:'0 -8px 40px rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:18, background:'rgba(0,0,0,0.06)', border:'none', color:'#6b7280', fontSize:'1rem', width:32, height:32, borderRadius:'50%', cursor:'pointer' }}>✕</button>

        {/* Header */}
        <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#1e1b4b', marginBottom:4 }}>Explícame este tema 🧠</div>
        <div style={{ fontSize:'0.8rem', color:'#6b7280', marginBottom:20 }}>Sube tu PDF o escribe el tema, y dime cómo quieres que te lo explique</div>

        {/* PDF upload */}
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
        <div onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          style={{ border:'2px dashed rgba(124,58,237,0.35)', borderRadius:16, padding:'18px 16px', textAlign:'center', cursor:'pointer', marginBottom:16, background:pdfName ? 'rgba(124,58,237,0.05)' : 'transparent' }}>
          {loadingPDF ? (
            <div style={{ color:'#7c3aed', fontWeight:700 }}>Procesando PDF...</div>
          ) : pdfName ? (
            <>
              <div style={{ fontSize:'1.8rem', marginBottom:4 }}>📄</div>
              <div style={{ color:'#7c3aed', fontSize:'0.85rem', fontWeight:700 }}>{pdfName}</div>
              <div style={{ color:'#9ca3af', fontSize:'0.72rem', marginTop:3 }}>Toca para cambiar</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:'2rem', marginBottom:6 }}>📎</div>
              <div style={{ color:'#7c3aed', fontSize:'0.88rem', fontWeight:700 }}>Subir PDF o .txt</div>
              <div style={{ color:'#9ca3af', fontSize:'0.72rem', marginTop:3 }}>o arrastra aquí</div>
            </>
          )}
        </div>

        {/* Topic input */}
        <div style={{ marginBottom:18 }}>
          <label style={lbl}>O escribe el tema que quieres estudiar</label>
          <textarea value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="Ej: La idoneidad del producto en derecho del consumidor peruano..."
            style={{ ...inp, minHeight:80 }} />
        </div>

        {/* Style presets */}
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>¿Cómo quieres que te lo explique?</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
            {STYLE_PRESETS.map((preset, i) => (
              <button key={i} onClick={() => setSelectedPreset(selectedPreset === i ? null : i)} style={{
                padding:'10px 14px', borderRadius:12, cursor:'pointer', textAlign:'left',
                fontFamily:'inherit', fontSize:'0.88rem', fontWeight: selectedPreset === i ? 700 : 500,
                background: selectedPreset === i ? 'rgba(124,58,237,0.1)' : '#fff',
                border:`1.5px solid ${selectedPreset === i ? 'rgba(124,58,237,0.4)' : 'rgba(0,0,0,0.1)'}`,
                color: selectedPreset === i ? '#6d28d9' : '#374151',
              }}>{preset.label}</button>
            ))}
          </div>
          <label style={lbl}>O escribe tu propia instrucción</label>
          <input value={customStyle} onChange={e => { setCustomStyle(e.target.value); setSelectedPreset(null) }}
            placeholder="Ej: Explícamelo con casos reales del Tribunal Constitucional..."
            style={inp} />
        </div>

        {/* Count */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <span style={{ ...lbl, marginBottom:0, flexShrink:0 }}>Slides a generar:</span>
          <div style={{ display:'flex', gap:6 }}>
            {[2, 4, 6, 8].map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                width:36, height:36, borderRadius:10, cursor:'pointer',
                fontFamily:'Space Mono,monospace', fontSize:'0.8rem', fontWeight:700,
                background: count === n ? 'rgba(124,58,237,0.12)' : '#fff',
                border:`1.5px solid ${count === n ? '#7c3aed' : 'rgba(0,0,0,0.1)'}`,
                color: count === n ? '#6d28d9' : '#6b7280',
              }}>{n}</button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading || !topic.trim()} style={{
          width:'100%', padding:'15px', border:'none', borderRadius:14,
          background:'linear-gradient(135deg,#7c3aed,#be185d)',
          backgroundSize:'200% 200%', animation:'gradient-shift 3s ease infinite',
          color:'#fff', fontFamily:'inherit', fontWeight:900, fontSize:'1rem',
          cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !topic.trim() ? 0.5 : 1,
          boxShadow:'0 4px 24px rgba(124,58,237,0.35)',
        }}>
          {loading ? 'Generando slides...' : `Generar ${count} slides didácticos ⚡`}
        </button>
      </div>
    </div>
  )
}
