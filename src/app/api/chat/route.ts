import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatCompletion } from '@/lib/api/minimax'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'

const log = logger

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { messages, locale = 'zh' } = body

    // Language instruction based on locale
    const languageInstructions: Record<string, string> = {
      zh: '你是一个友好的AI助手，请用中文回复用户。',
      en: 'You are a friendly AI assistant. Please reply to the user in English.',
      ja: 'あなたは친절なAIアシスタントです。日本語で返信してください。',
    }

    const systemMessage = languageInstructions[locale] || languageInstructions.zh

    // Prepend system message for language context
    const allMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages,
    ]

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

    const response = await chatCompletion(allMessages)

    await prisma.tokenUsage.create({
      data: {
        userId: session.user.id,
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
