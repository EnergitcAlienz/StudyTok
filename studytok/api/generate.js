export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { text, count = 3, mode = 'cards' } = await req.json()

    if (!text || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Texto muy corto' }), { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key no configurada' }), { status: 500 })
    }

    let prompt
    if (mode === 'chat') {
      // Asistente de investigación
      prompt = `Eres un asistente académico amigable para una estudiante de Derecho en Perú. 
Responde de forma clara, concisa y útil sobre el tema consultado.
Usa ejemplos peruanos cuando sea relevante (INDECOPI, Tribunal Constitucional, legislación peruana).
Responde en español, máximo 3 párrafos, sin listas largas.

Pregunta del usuario: ${text}`
    } else {
      // Generar tarjetas de estudio
      prompt = `Eres un asistente académico. A partir del siguiente texto, genera exactamente ${count} tarjetas de estudio en español. 
Varía los tipos: concept, fact, quiz, memory. Prioriza quiz y memory porque son más interactivas.

Responde SOLO con un array JSON válido, sin markdown, sin texto extra.

Formatos:
- concept: {"type":"concept","subject":"materia","title":"título corto","body":"explicación clara en 2-3 oraciones"}
- fact: {"type":"fact","subject":"materia","title":"título con emoji","body":"dato importante en 1-2 oraciones"}  
- quiz: {"type":"quiz","subject":"materia","title":"título","question":"pregunta directa","options":[{"text":"opción A","correct":false},{"text":"opción B","correct":true},{"text":"opción C","correct":false},{"text":"opción D","correct":false}],"explanation":"explicación breve de por qué es correcta"}
- memory: {"type":"memory","subject":"materia","title":"Memoria","front":"pregunta o concepto clave","back":"respuesta o definición completa"}

Texto fuente:
${text.slice(0, 4000)}`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: mode === 'chat' ? 600 : 2500,
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
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse cards
    const clean = raw.replace(/```json|```/g, '').trim()
    const cards = JSON.parse(clean)

    return new Response(JSON.stringify({ cards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
