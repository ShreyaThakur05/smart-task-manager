import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string, email: string }
  } catch {
    return null
  }
}

export const getAuthUser = (request: Request) => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}