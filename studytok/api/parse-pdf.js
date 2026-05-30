import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: { bodyParser: false },
}

// Pure JS PDF text extractor — no native deps, works on Vercel
function extractTextFromPDF(buffer) {
  const bytes = new Uint8Array(buffer)
  let raw = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b >= 32 && b < 127) raw += String.fromCharCode(b)
    else if (b === 10 || b === 13) raw += ' '
  }

  // Method 1: extract text between parentheses (PDF text streams)
  let text = ''
  const matches = [...raw.matchAll(/\(([^)]{2,300})\)/g)]
  for (const m of matches) {
    const s = m[1].trim()
    if (s.length > 3 && /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(s) && !/^[\\/]/.test(s)) {
      text += s + ' '
    }
  }

  // Method 2: fallback — extract readable ASCII runs
  if (text.length < 200) {
    text = raw
      .replace(/[^\x20-\x7EáéíóúüñÁÉÍÓÚÜÑ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return text.replace(/\s+/g, ' ').trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({ maxFileSize: 20 * 1024 * 1024 }) // 20MB
    const [, files] = await form.parse(req)

    const file = files.pdf?.[0] || files.file?.[0]
    if (!file) return res.status(400).json({ error: 'No se recibió archivo' })

    const ext = path.extname(file.originalFilename || '').toLowerCase()
    let text = ''

    if (ext === '.pdf') {
      const buffer = fs.readFileSync(file.filepath)
      text = extractTextFromPDF(buffer)
      if (text.length < 50) {
        return res.status(422).json({
          error: 'PDF sin texto extraíble. Es posible que sea una imagen escaneada. Intenta copiar el texto manualmente.',
        })
      }
    } else {
      // .txt, .md, etc
      text = fs.readFileSync(file.filepath, 'utf8')
    }

    // Cleanup temp file
    try { fs.unlinkSync(file.filepath) } catch {}

    return res.status(200).json({ text: text.slice(0, 6000) })
  } catch (e) {
    return res.status(500).json({ error: 'Error procesando archivo: ' + e.message })
  }
}
