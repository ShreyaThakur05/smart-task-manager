import { MongoClient } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  client = new MongoClient(process.env.MONGODB_URI)
  clientPromise = client.connect()
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('taskmanagement')
    const tasks = await db.collection('tasks').find({}).toArray()
    const lists = await db.collection('lists').find({}).toArray()
    
    return NextResponse.json({ tasks, lists })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()
    const client = await clientPromise
    const db = client.db('taskmanagement')
    
    if (type === 'task') {
      await db.collection('tasks').insertOne(data)
    } else if (type === 'list') {
      await db.collection('lists').insertOne(data)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type, id, data } = await request.json()
    const client = await clientPromise
    const db = client.db('taskmanagement')
    
    if (type === 'task') {
      await db.collection('tasks').updateOne({ id }, { $set: data })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { type, id } = await request.json()
    const client = await clientPromise
    const db = client.db('taskmanagement')
    
    if (type === 'task') {
      await db.collection('tasks').deleteOne({ id })
    } else if (type === 'list') {
      await db.collection('lists').deleteOne({ id })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}