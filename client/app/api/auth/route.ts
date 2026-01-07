import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from '../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json()
    
    console.log('Auth request:', { action, email, hasPassword: !!password, name })
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Demo account
    if (email === 'shreya_list@demo.com' && password === 'test123') {
      const token = jwt.sign({ userId: 'demo-user', email }, process.env.JWT_SECRET, { expiresIn: '7d' })
      return NextResponse.json({
        user: { id: 'demo-user', email, name: 'Shreya Demo' },
        token
      })
    }
    
    console.log('Connecting to MongoDB...')
    const client = await clientPromise
    const db = client.db('taskmanagement')
    const users = db.collection('users')
    console.log('MongoDB connected successfully')
    
    if (action === 'register') {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
      }

      console.log('Checking for existing user...')
      const existingUser = await users.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists. Please login instead.' }, { status: 400 })
      }
      
      console.log('Hashing password...')
      const hashedPassword = await bcrypt.hash(password, 12)
      
      console.log('Creating new user...')
      const result = await users.insertOne({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log('User created with ID:', result.insertedId)
      const token = jwt.sign({ userId: result.insertedId.toString(), email: email.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      // Send welcome email (non-blocking)
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      }).catch(() => console.log('Welcome email failed'))
      
      return NextResponse.json({
        user: { id: result.insertedId.toString(), email: email.toLowerCase(), name: name.trim() },
        token
      })
    }
    
    if (action === 'login') {
      console.log('Looking for user...')
      const user = await users.findOne({ email: email.toLowerCase() })
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      
      console.log('Verifying password...')
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      
      console.log('Login successful for user:', user._id)
      const token = jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return NextResponse.json({
        user: { id: user._id.toString(), email: user.email, name: user.name },
        token
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Detailed auth error:', error)
    return NextResponse.json({ error: `Authentication failed: ${error.message}` }, { status: 500 })
  }
}