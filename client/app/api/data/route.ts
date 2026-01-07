import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'
import { getAuthUser } from '../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('taskmanagement')
    
    const userData = await db.collection('userdata').findOne({ userId: user.userId })
    
    return NextResponse.json({
      tasks: userData?.tasks || [],
      lists: userData?.lists || [
        { id: 'backlog', title: 'Backlog' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'review', title: 'Review' },
        { id: 'done', title: 'Done' }
      ]
    })
  } catch (error) {
    console.error('Data load error:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tasks, lists } = await request.json()
    
    if (!Array.isArray(tasks) || !Array.isArray(lists)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('taskmanagement')
    
    await db.collection('userdata').updateOne(
      { userId: user.userId },
      { 
        $set: { 
          tasks, 
          lists,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Data save error:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}