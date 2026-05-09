import { NextRequest, NextResponse } from 'next/server'
import { generateMusic } from '@/lib/api/minimax'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'

const log = logger

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const { taskId } = params

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    log.info({
      requestId,
      userId,
      module: 'api/songs/regenerate',
      action: 'regenerate_request',
      durationMs: Date.now() - startTime,
      payload: { taskId }
    })

    // Get existing song task
    const songTask = await prisma.songTask.findUnique({
      where: { id: taskId },
    })

    if (!songTask) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (songTask.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
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
        musicResult = await generateMusic(songTask.prompt, songTask.lyrics || '')
        log.info({
          requestId,
          userId,
          module: 'api/songs/regenerate',
          action: 'regenerate_api_success',
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
            module: 'api/songs/regenerate',
            action: 'regenerate_api_retry',
            durationMs: Date.now() - startTime,
            payload: { retry: retries, delay }
          })
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (!musicResult && lastError) {
      await prisma.songTask.update({
        where: { id: taskId },
        data: { status: 'failed', error: lastError.message },
      })
      throw lastError
    }

    // Update task with new music URL and status done
    await prisma.songTask.update({
      where: { id: taskId },
      data: {
        status: 'done',
        musicUrl: musicResult!.musicUrl,
        error: null,
      },
    })

    log.info({
      requestId,
      userId,
      module: 'api/songs/regenerate',
      action: 'regenerate_success',
      durationMs: Date.now() - startTime,
      payload: { taskId, musicUrl: musicResult!.musicUrl }
    })

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        musicUrl: musicResult!.musicUrl,
      },
    })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: null,
      module: 'api/songs/regenerate',
      action: 'regenerate_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return NextResponse.json(
      { success: false, error: 'Failed to regenerate song. Please try again.' },
      { status: 500 }
    )
  }
}
