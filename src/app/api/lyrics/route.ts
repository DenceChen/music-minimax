import { NextRequest, NextResponse } from 'next/server'
import { generateLyrics } from '@/lib/api/minimax'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'
import crypto from 'crypto'

const log = logger

function getCacheKey(prompt: string): string {
  return crypto.createHash('md5').update(prompt).digest('hex')
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt' },
        { status: 400 }
      )
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Prompt too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const cacheKey = getCacheKey(prompt)
    log.info({
      requestId,
      userId: null,
      module: 'api/lyrics',
      action: 'lyrics_request_received',
      durationMs: Date.now() - startTime,
      payload: { cacheKey, promptLength: prompt.length }
    })

    // Check cache first
    const cached = await prisma.lyricsCache.findUnique({
      where: { cacheKey },
    })

    if (cached && cached.expiresAt > new Date()) {
      log.info({
        requestId,
        userId: null,
        module: 'api/lyrics',
        action: 'lyrics_cache_hit',
        durationMs: Date.now() - startTime,
        payload: { cacheKey }
      })
      return NextResponse.json({
        success: true,
        data: {
          lyrics: cached.lyrics,
          cached: true,
          cacheKey,
        },
      })
    }

    // Call MiniMax API with retry logic (exponential backoff: 1s, 2s, 4s)
    let lyrics = ''
    let retries = 0
    const maxRetries = 3
    let lastError: Error | null = null

    while (retries < maxRetries) {
      try {
        const apiStartTime = Date.now()
        lyrics = await generateLyrics(prompt)
        log.info({
          requestId,
          userId: null,
          module: 'api/lyrics',
          action: 'lyrics_api_success',
          durationMs: Date.now() - apiStartTime,
          payload: { lyricsLength: lyrics.length }
        })
        break
      } catch (error) {
        lastError = error as Error
        retries++

        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 1000 // 1s, 2s, 4s
          log.warn({
            requestId,
            userId: null,
            module: 'api/lyrics',
            action: 'lyrics_api_retry',
            durationMs: Date.now() - startTime,
            payload: { retry: retries, delay }
          })
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (!lyrics && lastError) {
      throw lastError
    }

    // Store in cache (24h expiry)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await prisma.lyricsCache.upsert({
      where: { cacheKey },
      update: {
        lyrics,
        expiresAt,
      },
      create: {
        cacheKey,
        prompt,
        lyrics,
        expiresAt,
      },
    })

    log.info({
      requestId,
      userId: null,
      module: 'api/lyrics',
      action: 'lyrics_cached',
      durationMs: Date.now() - startTime,
      payload: { cacheKey, expiresAt }
    })

    return NextResponse.json({
      success: true,
      data: {
        lyrics,
        cached: false,
        cacheKey,
      },
    })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: null,
      module: 'api/lyrics',
      action: 'lyrics_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    if (err.message.includes('429')) {
      return NextResponse.json(
        { success: false, error: 'Rate limited, please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate lyrics. Please try again.' },
      { status: 500 }
    )
  }
}
