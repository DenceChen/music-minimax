import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/api/minimax'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'

const log = logger

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Input validation - check message count and total length
    if (messages.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Too many messages (max 20)' },
        { status: 400 }
      )
    }

    log.info({
      requestId,
      userId: null,
      module: 'api/chat',
      action: 'chat_request_received',
      durationMs: Date.now() - startTime,
      payload: { messageCount: messages.length }
    })

    const response = await chatCompletion(messages)

    await prisma.tokenUsage.create({
      data: {
        userId: 'anonymous',
        action: 'chat',
        tokens: response.usage?.total_tokens || 0,
      },
    })

    log.info({
      requestId,
      userId: null,
      module: 'api/chat',
      action: 'chat_response_success',
      durationMs: Date.now() - startTime,
      payload: {
        tokens: response.usage?.total_tokens,
        responseId: response.id
      }
    })

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: null,
      module: 'api/chat',
      action: 'chat_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return NextResponse.json(
      { success: false, error: 'Chat service temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}
