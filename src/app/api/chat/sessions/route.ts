import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 获取用户的所有聊天会话
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { sessions }
    })
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 创建新聊天会话
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title = '新对话' } = body

    const newSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title
      },
      include: {
        messages: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { session: newSession }
    })
  } catch (error) {
    console.error('Failed to create chat session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
