import { useEffect, useRef } from 'react'

export default function Toast({ toast }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', zIndex: 300,
      transform: toast.show
        ? 'translate(-50%,-50%) scale(1)'
        : 'translate(-50%,-50%) scale(0.8)',
      opacity: toast.show ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 20, padding: '18px 28px', textAlign: 'center',
      pointerEvents: 'none', minWidth: 200,
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>{toast.emoji}</div>
      <div style={{ fontWeight: 900, fontSize: '1rem', color: '#1e1b4b' }}>{toast.text}</div>
      {toast.sub && <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b7280', marginTop: 4 }}>{toast.sub}</div>}
    </div>
  )
}
