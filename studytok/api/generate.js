export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { text, count = 3, mode = 'cards', style = '' } = await req.json()

    if (!text || text.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'Texto muy corto' }), { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key no configurada' }), { status: 500 })
    }

    let prompt

    if (mode === 'chat') {
      prompt = `Eres un asistente académico amigable para una estudiante de Derecho en Perú.
Responde de forma clara, concisa y útil. Usa ejemplos peruanos cuando sea relevante.
Responde en español, máximo 3 párrafos.
Pregunta: ${text}`

    } else if (mode === 'explain') {
      // Modo "Explícame" — contenido didáctico personalizado
      prompt = `Eres un tutor creativo para una estudiante de Derecho en Perú.
La estudiante quiere aprender sobre este tema: "${text}"
Instrucción de cómo quiere que se lo expliques: "${style || 'de forma didáctica y creativa'}"

Genera exactamente ${count} slides de estudio en español. Cada slide debe ser visualmente rico y didáctico.
Varía los tipos según el contenido: story, analogy, visual, quiz, fact.

Responde SOLO con array JSON, sin markdown.

Formatos:
- story: {"type":"story","subject":"materia","title":"título","narrative":"historia corta que explica el concepto en 3-4 oraciones","emoji":"🎭","color":"purple"}
- analogy: {"type":"analogy","subject":"materia","title":"título","comparison":"explica el concepto comparándolo con algo cotidiano","left":"concepto legal","right":"analogía cotidiana","emoji":"⚖️","color":"pink"}
- visual: {"type":"visual","subject":"materia","title":"título","points":["punto clave 1","punto clave 2","punto clave 3"],"icon":"📋","emoji":"✨","color":"green"}
- quiz: {"type":"quiz","subject":"materia","title":"título","question":"pregunta","options":[{"text":"A","correct":false},{"text":"B","correct":true},{"text":"C","correct":false},{"text":"D","correct":false}],"explanation":"por qué","emoji":"❓","color":"pink"}
- fact: {"type":"fact","subject":"materia","title":"título con emoji","body":"dato impactante","emoji":"⚡","highlight":"frase clave a destacar","color":"green"}

El campo "color" debe ser uno de: purple, pink, green, yellow.
Haz el contenido memorable, usa ejemplos reales peruanos cuando aplique.`

    } else {
      // Modo tarjetas clásico
      prompt = `Eres un asistente académico. Genera exactamente ${count} tarjetas de estudio en español.
Varía los tipos: concept, fact, quiz, memory. Prioriza quiz y memory.

Responde SOLO con array JSON, sin markdown.

Formatos:
- concept: {"type":"concept","subject":"materia","title":"título","body":"explicación 2-3 oraciones","emoji":"📖"}
- fact: {"type":"fact","subject":"materia","title":"título con emoji","body":"dato importante","emoji":"⚡"}
- quiz: {"type":"quiz","subject":"materia","title":"título","question":"pregunta","options":[{"text":"A","correct":false},{"text":"B","correct":true},{"text":"C","correct":false},{"text":"D","correct":false}],"explanation":"por qué","emoji":"❓"}
- memory: {"type":"memory","subject":"materia","title":"Memoria","front":"pregunta","back":"respuesta","emoji":"🃏"}

Texto fuente: ${text.slice(0, 4000)}`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: mode === 'chat' ? 600 : 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: 'Error de API: ' + err }), { status: 500 })
    }

    const data = await response.json()
    const raw = data.content?.find(b => b.type === 'text')?.text || ''

    if (mode === 'chat') {
      return new Response(JSON.stringify({ reply: raw }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    const clean = raw.replace(/```json|```/g, '').trim()
    const cards = JSON.parse(clean)

    return new Response(JSON.stringify({ cards }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
