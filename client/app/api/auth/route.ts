import { MongoClient } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Global connection variable
let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  if (cachedClient) {
    try {
      // Check if client is still connected
      await cachedClient.db('admin').command({ ping: 1 })
      return cachedClient
    } catch (error) {
      // Client is disconnected, create new one
      cachedClient = null
    }
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    })
    
    await client.connect()
    
    // Test the connection
    await client.db('admin').command({ ping: 1 })
    console.log('Successfully connected to MongoDB Atlas')
    
    cachedClient = client
    return client
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    cachedClient = null
    throw error
  }
}

export async function POST(request: NextRequest) {
  console.log('Auth API called')
  
  try {
    const body = await request.json()
    console.log('Request body:', { ...body, password: '[HIDDEN]' })
    
    const { action, email, password, name } = body

    // Validate required fields
    if (!action || !email || !password) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      console.log('Password too short')
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // For demo purposes, accept the test user without database
    if (email === 'shreya_list' && password === 'test123') {
      console.log('Demo user login')
      const demoUser = {
        id: 'demo-user-shreya',
        email: 'shreya_list',
        name: 'Shreya Demo User'
      }
      const token = jwt.sign({ userId: demoUser.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' })
      
      return NextResponse.json({
        user: demoUser,
        token
      })
    }

    try {
      console.log('Attempting to connect to database...')
      const mongoClient = await connectToDatabase()
      console.log('Database connected successfully')
      
      const db = mongoClient.db('taskmanagement')
      const users = db.collection('users')

      if (action === 'register') {
        console.log('Processing registration for:', email)
        
        // Validate name for registration
        if (!name || name.trim().length < 2) {
          return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
        }

        const existingUser = await users.findOne({ email: email.toLowerCase() })
        if (existingUser) {
          console.log('User already exists:', email)
          return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = {
          id: Date.now().toString(),
          email: email.toLowerCase(),
          name: name.trim(),
          password: hashedPassword,
          createdAt: new Date().toISOString()
        }

        console.log('Creating new user:', { ...user, password: '[HIDDEN]' })
        const result = await users.insertOne(user)
        console.log('User created with ID:', result.insertedId)
        
        if (!result.insertedId) {
          return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
        }

        // Create default lists for new user
        const defaultLists = [
          { id: 'backlog', title: 'Backlog', userId: user.id },
          { id: 'in-progress', title: 'In Progress', userId: user.id },
          { id: 'review', title: 'Review', userId: user.id },
          { id: 'done', title: 'Done', userId: user.id }
        ]
        await db.collection('lists').insertMany(defaultLists)
        console.log('Default lists created for user')

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' })
        
        return NextResponse.json({
          user: { id: user.id, email: user.email, name: user.name },
          token
        })
      }

      if (action === 'login') {
        console.log('Processing login for:', email)
        
        const user = await users.findOne({ email: email.toLowerCase() })
        if (!user) {
          console.log('User not found:', email)
          return NextResponse.json({ error: 'No account found with this email address' }, { status: 400 })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          console.log('Invalid password for user:', email)
          return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
        }

        console.log('Login successful for:', email)
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' })
        
        return NextResponse.json({
          user: { id: user.id, email: user.email, name: user.name },
          token
        })
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({ error: 'Database temporarily unavailable. Please try the demo account: shreya_list / test123' }, { status: 503 })
    }
  } catch (error) {
    console.error('Auth API Error:', error)
    return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
  }
}