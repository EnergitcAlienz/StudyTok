export const config = { api: { bodyParser: false, sizeLimit: '20mb' } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    const boundary = req.headers['content-type']?.split('boundary=')[1]
    if (!boundary) return res.status(400).json({ error: 'No boundary' })

    const bodyStr = buffer.toString('latin1')
    const parts = bodyStr.split('--' + boundary)
    let fileBuffer = null

    for (const part of parts) {
      if (part.includes('filename=') && part.includes('Content-Type')) {
        const dataStart = part.indexOf('\r\n\r\n') + 4
        const dataEnd = part.lastIndexOf('\r\n')
        if (dataStart > 3 && dataEnd > dataStart) {
          fileBuffer = Buffer.from(part.slice(dataStart, dataEnd), 'latin1')
          break
        }
      }
    }

    if (!fileBuffer) return res.status(400).json({ error: 'No se recibió archivo' })

    const bytes = new Uint8Array(fileBuffer)
    let raw = ''
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i]
      if (b >= 32 && b < 127) raw += String.fromCharCode(b)
      else if (b === 10 || b === 13) raw += ' '
    }

    let text = ''
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

    if (text.length < 50) return res.status(422).json({ error: 'PDF sin texto extraíble. Pega el texto manualmente.' })

    return res.status(200).json({ text: text.slice(0, 6000) })
  } catch (e) {
    return res.status(500).json({ error: 'Error: ' + e.message })
  }
}
