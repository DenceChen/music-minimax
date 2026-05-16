const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY
const MINIMAX_API_BASE = process.env.MINIMAX_API_BASE || 'https://api.minimaxi.com'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatCompletionResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface LyricsResponse {
  id: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface MusicResponse {
  data?: {
    audio?: string
  }
  error?: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  model: string = 'MiniMax-M2.7-highspeed'
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${MINIMAX_API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MiniMax API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

interface LyricsGenerationResponse {
  song_title: string
  style_tags: string
  lyrics: string
  base_resp: {
    status_code: number
    status_msg: string
  }
}

export async function generateLyrics(prompt: string): Promise<{ song_title: string; style_tags: string; lyrics: string }> {
  const response = await fetch(`${MINIMAX_API_BASE}/v1/lyrics_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      mode: 'write_full_song',
      prompt: prompt,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MiniMax API error: ${response.status} - ${errorText}`)
  }

  const data: LyricsGenerationResponse = await response.json()

  if (data.base_resp?.status_code !== 0) {
    throw new Error(data.base_resp?.status_msg || 'Lyrics generation failed')
  }

  return {
    song_title: data.song_title || '',
    style_tags: data.style_tags || '',
    lyrics: data.lyrics || ''
  }
}

export interface MusicResult {
  musicUrl: string
}

export async function generateMusic(
  prompt: string,
  lyrics: string
): Promise<MusicResult> {
  const response = await fetch(`${MINIMAX_API_BASE}/v1/music_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'music-2.6',
      prompt,
      lyrics,
      output_format: 'url',
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: 'mp3',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MiniMax API error: ${response.status} - ${errorText}`)
  }

  const data: MusicResponse = await response.json()

  if (data.error) {
    throw new Error(data.error)
  }

  if (!data.data?.audio) {
    throw new Error('No audio URL in response')
  }

  return {
    musicUrl: data.data.audio,
  }
}
