import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        error: 'MONGODB_URI not found in environment variables',
        status: 'failed'
      }, { status: 500 })
    }

    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    
    // Test database connection
    const db = client.db('taskmanagement')
    await db.admin().ping()
    
    await client.close()
    
    return NextResponse.json({ 
      message: 'MongoDB connection successful',
      status: 'connected',
      database: 'taskmanagement'
    })
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }, { status: 500 })
  }
}