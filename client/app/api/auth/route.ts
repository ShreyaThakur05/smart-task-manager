import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from '../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json()
    
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('taskmanagement')
    const users = db.collection('users')
    
    if (action === 'login') {
      // Demo account
      if (email === 'shreya_list@demo.com' && password === 'test123') {
        const token = jwt.sign({ userId: 'demo-user', email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
        return NextResponse.json({
          user: { id: 'demo-user', email, name: 'Shreya Demo' },
          token
        })
      }
      
      // Check if user exists
      const user = await users.findOne({ email })
      if (!user) {
        return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 401 })
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
      
      const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
      return NextResponse.json({
        user: { id: user._id, email: user.email, name: user.name },
        token
      })
    }
    
    if (action === 'register') {
      // Check if user already exists
      const existingUser = await users.findOne({ email })
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists. Please login instead.' }, { status: 400 })
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // Create user
      const result = await users.insertOne({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date()
      })
      
      const token = jwt.sign({ userId: result.insertedId, email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
      
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
      
      return NextResponse.json({
        user: { id: result.insertedId, email, name },
        token
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}