'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Plus, MoreHorizontal, Circle, Clock, CheckCircle, AlertCircle, Edit, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '../store/taskStore'
import Card from './Card'
import TaskCreateModal from './TaskCreateModal'
import { AnimatePresence } from 'framer-motion'

interface ListProps {
  list: {
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
  }
}

export default function List({ list }: ListProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { addTask, deleteList } = useTaskStore()
  
  const isDefaultList = ['backlog', 'in-progress', 'review', 'done'].includes(list.id)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: list.id })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDragProps = {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners
  }

  const getListColor = (title: string) => {
    switch (title.toLowerCase()) {
      case 'backlog': return 'border-t-slate-500 bg-slate-50 dark:bg-slate-900/20'
      case 'in progress': return 'border-t-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'review': return 'border-t-amber-500 bg-amber-50 dark:bg-amber-900/20'
      case 'done': return 'border-t-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
      default: return 'border-t-gray-400 bg-gray-50 dark:bg-gray-800'
    }
  }

  const getListIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'backlog': return <Circle className="w-4 h-4 text-gray-500" />
      case 'in progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'review': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Circle className="w-4 h-4 text-gray-500" />
    }
  }

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return
    
    try {
      await addTask({
        title: newCardTitle,
        description: '',
        priority: 'medium',
        status: ['backlog', 'in-progress', 'review', 'done'].includes(list.id) 
          ? (() => {
              const statusMap: { [key: string]: 'backlog' | 'in-progress' | 'review' | 'done' } = {
                'backlog': 'backlog',
                'in progress': 'in-progress',
                'review': 'review',
                'done': 'done'
              }
              return statusMap[list.title.toLowerCase()] || 'backlog'
            })()
          : 'backlog',
        labels: [],
        list_id: ['backlog', 'in-progress', 'review', 'done'].includes(list.id) ? undefined : list.id
      })
      
      setNewCardTitle('')
      setShowAddCard(false)
    } catch (error) {
      // Handle error silently or show notification
    }
  }

  return (
    <div 
      className={`min-w-80 rounded-xl border-t-4 ${getListColor(list.title)} shadow-sm transition-all duration-300 ${isCollapsed ? 'min-w-16' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* List Header */}
      <div {...handleDragProps} className="p-4 pb-2 cursor-grab active:cursor-grabbing">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getListIcon(list.title)}
            {!isCollapsed && (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {list.title}
                </h3>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium">
                  {list.cards.length}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {!isCollapsed && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowListMenu(!showListMenu)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {showListMenu && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-48 z-50">
                    <button
                      onClick={() => {
                        setShowTaskModal(true)
                        setShowListMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Card
                    </button>

                    {!isDefaultList && (
                      <>
                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete List
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cards Container */}
      {!isCollapsed && (
        <div 
          ref={setDroppableRef}
          className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto min-h-[100px]"
        >
          {list.cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
          
          {/* Add Card Form */}
          {showAddCard ? (
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 border-2 border-dashed border-blue-300 dark:border-blue-600">
              <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddCard()
                  if (e.key === 'Escape') setShowAddCard(false)
                }}
                placeholder="Enter card title..."
                className="w-full p-2 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddCard}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Add Card
                </button>
                <button
                  onClick={() => {
                    setShowAddCard(false)
                    setNewCardTitle('')
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Add Card Buttons */
            <div className="space-y-2">
              <button 
                onClick={() => setShowAddCard(true)}
                className="w-full text-left text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 group"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Quick add</span>
                </div>
              </button>
              
              <button 
                onClick={() => setShowTaskModal(true)}
                className="w-full text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Add with details</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Floating Quick Add Button */}
      {isHovered && !isCollapsed && !showAddCard && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setShowAddCard(true)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-10"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      )}
      
      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        defaultStatus={(() => {
          const statusMap: { [key: string]: 'backlog' | 'in-progress' | 'review' | 'done' } = {
            'backlog': 'backlog',
            'in progress': 'in-progress', 
            'review': 'review',
            'done': 'done'
          }
          return statusMap[list.title.toLowerCase()] || 'backlog'
        })()}
        defaultListId={['backlog', 'in-progress', 'review', 'done'].includes(list.id) ? undefined : list.id}
      />
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 z-50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete List</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{list.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      await deleteList(list.id)
                      setShowDeleteModal(false)
                      setShowListMenu(false)
                    } catch (error) {
                      // Handle error
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Click outside to close menu */}
      {showListMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowListMenu(false)}
        />
      )}
    </div>
  )
}