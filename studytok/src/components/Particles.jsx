import { useState, useEffect } from 'react'

export default function Particles({ trigger }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!trigger) return
    const emojis = ['🌸','⭐','🌟','✨','🎯','💫','🌈','🎉','💥','🔥']
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      em: emojis[Math.floor(Math.random() * emojis.length)],
      x: 60 + Math.random() * (window.innerWidth - 120),
      y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 120,
      delay: i * 55,
    }))
    setParticles(items)
    setTimeout(() => setParticles([]), 1200)
  }, [trigger])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 400 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.x, top: p.y, fontSize: '1.5rem',
          animation: `flyup 1s ease-out ${p.delay}ms forwards`,
        }}>{p.em}</div>
      ))}
    </div>
  )
}
