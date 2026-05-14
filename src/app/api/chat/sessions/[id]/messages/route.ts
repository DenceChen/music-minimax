import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - 添加消息到会话
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { role, content } = body

    if (!role || !content) {
      return NextResponse.json({ error: 'Missing role or content' }, { status: 400 })
    }

    // Verify ownership
    const chatSession = await prisma.chatSession.findUnique({
      where: { id }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role,
        content
      }
    })

    // Update session's updatedAt
    await prisma.chatSession.update({
      where: { id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: { message }
    })
  } catch (error) {
    console.error('Failed to add message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
