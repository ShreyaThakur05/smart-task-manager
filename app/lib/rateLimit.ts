import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(limit: number = 10, windowMs: number = 60000) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    const windowStart = now - windowMs

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, [])
    }

    const requests = rateLimitMap.get(ip)
    const validRequests = requests.filter((time: number) => time > windowStart)
    
    if (validRequests.length >= limit) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    validRequests.push(now)
    rateLimitMap.set(ip, validRequests)
    
    return null
  }
}