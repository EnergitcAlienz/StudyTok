export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('pdf') || formData.get('file')

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se recibió archivo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    let text = ''
    let raw = ''
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i]
      if (b >= 32 && b < 127) raw += String.fromCharCode(b)
      else if (b === 10 || b === 13) raw += ' '
    }

    const matches = [...raw.matchAll(/\(([^)]{2,300})\)/g)]
    for (const m of matches) {
      const s = m[1].trim()
      if (s.length > 3 && /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(s) && !/^[\\\/]/.test(s)) {
        text += s + ' '
      }
    }

    if (text.length < 200) {
      text = raw.replace(/[^\x20-\x7EáéíóúüñÁÉÍÓÚÜÑ\s]/g, ' ').replace(/\s+/g, ' ').trim()
    }

    text = text.replace(/\s+/g, ' ').trim()

    if (text.length < 50) {
      return new Response(JSON.stringify({
        error: 'PDF sin texto extraíble. Pega el texto manualmente.',
      }), { status: 422, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ text: text.slice(0, 6000) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
