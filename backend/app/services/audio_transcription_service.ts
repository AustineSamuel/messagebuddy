import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

function extensionForMime(mimetype: string) {
  if (mimetype.includes('ogg')) return 'ogg'
  if (mimetype.includes('mpeg') || mimetype.includes('mp3')) return 'mp3'
  if (mimetype.includes('mp4') || mimetype.includes('m4a')) return 'm4a'
  if (mimetype.includes('wav')) return 'wav'
  if (mimetype.includes('webm')) return 'webm'
  return 'ogg'
}

export default class AudioTranscriptionService {
  static isConfigured() {
    return Boolean(env.get('OPENAI_API_KEY'))
  }

  static async transcribeBase64(data: string, mimetype: string): Promise<string> {
    const apiKey = env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured for transcription.')
    }

    const buffer = Buffer.from(data, 'base64')
    if (!buffer.length) {
      throw new Error('Audio file is empty.')
    }

    const ext = extensionForMime(mimetype)
    const tempPath = join(tmpdir(), `mb-audio-${randomUUID()}.${ext}`)
    await writeFile(tempPath, buffer)

    try {
      const baseUrl = (env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '')
      const model = env.get('OPENAI_WHISPER_MODEL') ?? 'whisper-1'

      const form = new FormData()
      const blob = new Blob([buffer], { type: mimetype || `audio/${ext}` })
      form.append('file', blob, `voice-note.${ext}`)
      form.append('model', model)

      const response = await fetch(`${baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      })

      if (!response.ok) {
        const body = await response.text()
        logger.error({ status: response.status, body }, 'Whisper transcription failed')
        throw new Error('Could not transcribe audio. Try again.')
      }

      const result = (await response.json()) as { text?: string }
      const text = result.text?.trim()
      if (!text) throw new Error('Transcription returned no text.')
      return text
    } finally {
      await unlink(tempPath).catch(() => undefined)
    }
  }
}
