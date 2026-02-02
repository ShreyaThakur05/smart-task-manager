'use client'

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Inbox } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from '../store/taskStore'
import List from './List'

interface BoardProps {
  board: {
    id: string
    title: string
    lists: Array<{
      id: string
      title: string
      cards: Array<{
        id: string
        title: string
        description?: string
        priority?: string
        assignee?: string
        dueDate?: string
        labels?: string[]
        subtasks?: { id: string; text: string; completed: boolean }[]
        comments?: { id: string; text: string; author: string; timestamp: string }[]
        attachments?: string[]
      }>
    }>
  }
  moveTask?: (taskId: string, newListId: string) => void
}

export default function Board({ board, moveTask }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showAddListModal, setShowAddListModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const { addList } = useTaskStore()
  
  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim())
      setNewListName('')
      setShowAddListModal(false)
    }
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    const activeCard = board.lists.flatMap(list => list.cards).find(card => card.id === activeId)
    if (activeCard && moveTask) {
      const targetList = board.lists.find(list => list.id === overId)
      if (targetList) {
        const statusMap: { [key: string]: 'backlog' | 'in-progress' | 'review' | 'done' } = {
          'backlog': 'backlog',
          'in-progress': 'in-progress', 
          'review': 'review',
          'done': 'done'
        }
        
        const newStatus = statusMap[targetList.id] || 'backlog'
        moveTask(activeId, newStatus)
      }
    }
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const isEmpty = board.lists.every(list => list.cards.length === 0)

  if (isEmpty) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your board is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by creating your first task to organize your work.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DndContext 
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCorners}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          <SortableContext items={board.lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
            {board.lists.map(list => (
              <List key={list.id} list={list} />
            ))}
          </SortableContext>
          
          {/* Add List Button */}
          <div className="min-w-80 flex-shrink-0">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddListModal(true)}
              className="w-full h-fit bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-6 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 rounded-full flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">Add another list</p>
                  <p className="text-xs text-gray-400 mt-1">Create a new workflow stage</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
        
        {/* Add List Modal */}
        <AnimatePresence>
          {showAddListModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowAddListModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 z-50"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New List</h3>
                <input
                  type="text"
                  placeholder="Enter list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddList}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add List
                  </button>
                  <button
                    onClick={() => setShowAddListModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-2xl border border-gray-200 dark:border-gray-700 opacity-90 transform rotate-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Moving card...
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}