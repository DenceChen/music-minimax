import { NextRequest, NextResponse } from 'next/server'
import { generateMusic } from '@/lib/api/minimax'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'

const log = logger
const MAX_DAILY_SONGS = parseInt(process.env.MAX_DAILY_SONGS || '5')

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  let requestUserId: string | null = null

  try {
    const body = await request.json()
    const { prompt, lyrics, userId } = body
    requestUserId = userId

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt (max 2000 characters)' },
        { status: 400 }
      )
    }

    if (!lyrics || typeof lyrics !== 'string' || lyrics.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Invalid lyrics (max 10000 characters)' },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    log.info({
      requestId,
      userId,
      module: 'api/music/generate',
      action: 'music_generate_request',
      durationMs: Date.now() - startTime,
      payload: { promptLength: prompt.length, lyricsLength: lyrics.length }
    })

    // Check daily limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Reset daily count if needed
    const now = new Date()
    const lastReset = new Date(user.dailyResetAt)
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    if (user.dailySongCount >= MAX_DAILY_SONGS) {
      return NextResponse.json(
        { success: false, error: `Daily limit reached (${MAX_DAILY_SONGS} songs per day)` },
        { status: 429 }
      )
    }

    // Call MiniMax API with retry logic (exponential backoff: 1s, 2s, 4s)
    let musicResult = null
    let retries = 0
    const maxRetries = 3
    let lastError: Error | null = null

    while (retries < maxRetries) {
      try {
        const apiStartTime = Date.now()
        musicResult = await generateMusic(prompt, lyrics)
        log.info({
          requestId,
          userId,
          module: 'api/music/generate',
          action: 'music_api_success',
          durationMs: Date.now() - apiStartTime,
        })
        break
      } catch (error) {
        lastError = error as Error
        retries++

        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 1000 // 1s, 2s, 4s
          log.warn({
            requestId,
            userId,
            module: 'api/music/generate',
            action: 'music_api_retry',
            durationMs: Date.now() - startTime,
            payload: { retry: retries, delay }
          })
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (!musicResult && lastError) {
      log.error({
        requestId,
        userId,
        module: 'api/music/generate',
        action: 'music_api_failed',
        durationMs: Date.now() - startTime,
        error: lastError.message,
      })
      return NextResponse.json(
        { success: false, error: 'Failed to generate music. Please try again.' },
        { status: 500 }
      )
    }

    // Create song task in database with musicUrl
    const songTask = await prisma.songTask.create({
      data: {
        userId,
        prompt,
        lyrics,
        status: 'done',
        musicUrl: musicResult!.musicUrl,
      },
    })

    // Increment daily song count
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailySongCount: isNewDay ? 1 : user.dailySongCount + 1,
        dailyResetAt: isNewDay ? now : undefined,
      },
    })

    log.info({
      requestId,
      userId,
      module: 'api/music/generate',
      action: 'music_generated_success',
      durationMs: Date.now() - startTime,
      payload: {
        songTaskId: songTask.id,
        musicUrl: musicResult!.musicUrl
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        taskId: songTask.id,
        musicUrl: musicResult!.musicUrl,
      },
    })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: requestUserId,
      module: 'api/music/generate',
      action: 'music_generate_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable. Please try again later.' },
      { status: 500 }
    )
  }
}
