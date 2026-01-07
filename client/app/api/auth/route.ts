import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json()
    
    // Email validation
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    
    if (action === 'login') {
      // Demo account
      if (email === 'shreya_list@demo.com' && password === 'test123') {
        return NextResponse.json({
          user: { id: 'demo-user', email, name: 'Shreya Demo' },
          token: 'demo-token'
        })
      }
      
      // Mock login for other users
      return NextResponse.json({
        user: { id: Date.now().toString(), email, name: email.split('@')[0] },
        token: 'user-token'
      })
    }
    
    if (action === 'register') {
      const user = { id: Date.now().toString(), email, name }
      
      // Send welcome email
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        })
      } catch (error) {
        console.log('Welcome email failed to send')
      }
      
      return NextResponse.json({ user, token: 'user-token' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}