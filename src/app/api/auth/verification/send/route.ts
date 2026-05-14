import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate a cryptographically secure random 6-digit code
function generateCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return (array[0] % 900000 + 100000).toString()
}

// POST - Send verification code
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Generate code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete old codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email }
    })

    // Store new code
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt
      }
    })

    // In production, you would send the code via email/SMS here
    console.log(`[VERIFICATION CODE] Email: ${email}, Code: ${code}`)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent'
    })
  } catch (error) {
    console.error('Failed to send verification code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
