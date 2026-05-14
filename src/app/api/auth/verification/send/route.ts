import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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
    // For demo purposes, we'll log it (in real app, use a proper email service)
    console.log(`[VERIFICATION CODE] Email: ${email}, Code: ${code}`)

    // Return success (in demo mode, also return the code for testing)
    // Remove this line in production!
    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // DEMO ONLY: Return code for testing (remove in production!)
      demoCode: code
    })
  } catch (error) {
    console.error('Failed to send verification code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
