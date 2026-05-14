import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - 删除聊天会话
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    await prisma.chatSession.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Session deleted'
    })
  } catch (error) {
    console.error('Failed to delete chat session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - 更新聊天会话（如重命名）
export async function PATCH(
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
    const { title } = body

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

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { title }
    })

    return NextResponse.json({
      success: true,
      data: { session: updated }
    })
  } catch (error) {
    console.error('Failed to update chat session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
