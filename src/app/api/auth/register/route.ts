import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logger, generateRequestId } from '@/lib/logger'

const log = logger

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { email, password, code } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (password.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Password too long (max 100 characters)' },
        { status: 400 }
      )
    }

    // Verify the code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() }
      }
    })

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Delete used code
    await prisma.verificationCode.deleteMany({
      where: { email }
    })

    log.info({
      requestId,
      userId: null,
      module: 'api/auth/register',
      action: 'register_request',
      durationMs: Date.now() - startTime,
      payload: { email }
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      log.info({
        requestId,
        userId: null,
        module: 'api/auth/register',
        action: 'register_user_exists',
        durationMs: Date.now() - startTime,
      })
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    })

    log.info({
      requestId,
      userId: user.id,
      module: 'api/auth/register',
      action: 'register_success',
      durationMs: Date.now() - startTime,
      payload: { userId: user.id }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    const err = error as Error
    log.error({
      requestId,
      userId: null,
      module: 'api/auth/register',
      action: 'register_error',
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
