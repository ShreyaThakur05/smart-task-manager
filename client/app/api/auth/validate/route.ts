import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      valid: true, 
      user: { 
        id: user.userId, 
        email: user.email 
      } 
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ error: 'Token validation failed' }, { status: 401 })
  }
}