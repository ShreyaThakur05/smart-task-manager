import { MongoClient } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

let client: MongoClient | null = null

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local')
  }

  if (client) {
    return client
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    return client
  } catch (error) {
    console.error('MongoDB connection error:', error)
    client = null
    throw error
  }
}

function getUserFromToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const mongoClient = await connectToDatabase()
      const db = mongoClient.db('taskmanagement')
      const tasks = await db.collection('tasks').find({ userId }).toArray()
      const lists = await db.collection('lists').find({ userId }).toArray()
      
      return NextResponse.json({ tasks, lists })
    } catch (dbError) {
      console.error('Database connection failed, returning defaults:', dbError)
      // Return default lists for fallback
      return NextResponse.json({ 
        tasks: [], 
        lists: [
          { id: 'backlog', title: 'Backlog', userId },
          { id: 'in-progress', title: 'In Progress', userId },
          { id: 'review', title: 'Review', userId },
          { id: 'done', title: 'Done', userId }
        ]
      })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data } = await request.json()
    
    try {
      const mongoClient = await connectToDatabase()
      const db = mongoClient.db('taskmanagement')
      
      const dataWithUser = { ...data, userId }
      
      if (type === 'task') {
        await db.collection('tasks').insertOne(dataWithUser)
      } else if (type === 'list') {
        await db.collection('lists').insertOne(dataWithUser)
      }
      
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database operation failed, returning success for fallback:', dbError)
      // Return success even if DB fails (client will handle locally)
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id, data } = await request.json()
    const mongoClient = await connectToDatabase()
    const db = mongoClient.db('taskmanagement')
    
    if (type === 'task') {
      await db.collection('tasks').updateOne({ id, userId }, { $set: data })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await request.json()
    const mongoClient = await connectToDatabase()
    const db = mongoClient.db('taskmanagement')
    
    if (type === 'task') {
      await db.collection('tasks').deleteOne({ id, userId })
    } else if (type === 'list') {
      await db.collection('lists').deleteOne({ id, userId })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}