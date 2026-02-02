import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    // Redirect to home page where client-side auth will handle the session
    return NextResponse.redirect(`${origin}/?code=${code}`)
  }

  return NextResponse.redirect(origin)
}