import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'

const log = logger

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    log.info({
      requestId,
      userId,
      module: 'api/songs',
      action: 'get_songs',
      durationMs: Date.now() - startTime,
    })

    const songs = await prisma.songTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        prompt: true,
        lyrics: true,
        musicUrl: true,
        error: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { songs },
    })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: null,
      module: 'api/songs',
      action: 'get_songs_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch songs. Please try again.' },
      { status: 500 }
    )
  }
}
