import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('MONGODB_URI preview:', process.env.MONGODB_URI?.substring(0, 20) + '...')
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        error: 'MONGODB_URI not found',
        env: Object.keys(process.env).filter(key => key.includes('MONGO'))
      })
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    console.log('Attempting to connect...')
    await client.connect()
    console.log('Connected to MongoDB')
    
    // Test ping
    await client.db('admin').command({ ping: 1 })
    console.log('Ping successful')
    
    const db = client.db('taskmanagement')
    
    // Test collections
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    // Count users
    const userCount = await db.collection('users').countDocuments()
    console.log('User count:', userCount)
    
    // Get sample users (without passwords)
    const users = await db.collection('users').find({}, { 
      projection: { password: 0 } 
    }).limit(5).toArray()
    
    await client.close()
    
    return NextResponse.json({
      status: 'success',
      database: 'taskmanagement',
      collections: collections.map(c => c.name),
      userCount,
      sampleUsers: users,
      connectionString: process.env.MONGODB_URI?.substring(0, 30) + '...'
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 })
  }
}