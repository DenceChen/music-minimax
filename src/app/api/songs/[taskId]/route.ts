import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'
import fs from 'fs'
import path from 'path'

const log = logger

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const { taskId } = params

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
      action: 'delete_song',
      durationMs: Date.now() - startTime,
      payload: { taskId }
    })

    // Get song task
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

    // Delete local file if exists (only if it's a local path)
    if (songTask.musicUrl && songTask.musicUrl.startsWith('/songs/')) {
      const filePath = path.join(process.cwd(), 'public', songTask.musicUrl)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        log.info({
          requestId,
          userId,
          module: 'api/songs',
          action: 'local_file_deleted',
          durationMs: Date.now() - startTime,
          payload: { filePath: songTask.musicUrl }
        })
      }
    }

    // Delete from database
    await prisma.songTask.delete({
      where: { id: taskId },
    })

    log.info({
      requestId,
      userId,
      module: 'api/songs',
      action: 'song_deleted',
      durationMs: Date.now() - startTime,
      payload: { taskId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: null,
      module: 'api/songs',
      action: 'delete_song_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return NextResponse.json(
      { success: false, error: 'Failed to delete song. Please try again.' },
      { status: 500 }
    )
  }
}
