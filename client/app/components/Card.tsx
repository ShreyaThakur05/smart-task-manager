'use client'

import { motion } from 'framer-motion'
import { Calendar, User, AlertCircle, CheckCircle2, MessageSquare, Paperclip, MoreHorizontal, Edit, Trash2, Copy, Archive, Flag } from 'lucide-react'
import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CardProps {
  card: {
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
    cover?: {
      type: 'color' | 'gradient'
      value: string
    }
  }
}

export default function Card({ card }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showCardMenu, setShowCardMenu] = useState(false)
  const { setSelectedTask, deleteTask, updateTask } = useTaskStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'high': return 'bg-gradient-to-r from-orange-500 to-amber-500'
      case 'medium': return 'bg-gradient-to-r from-yellow-400 to-orange-400'
      case 'low': return 'bg-gradient-to-r from-green-400 to-emerald-500'
      default: return 'bg-gradient-to-r from-gray-400 to-slate-500'
    }
  }

  const getCoverStyle = () => {
    if (!card.cover) return {}
    
    if (card.cover.type === 'gradient') {
      return { background: card.cover.value }
    }
    return { backgroundColor: card.cover.value }
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()
  const completedSubtasks = card.subtasks?.filter(st => st.completed).length || 0
  const totalSubtasks = card.subtasks?.length || 0

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setSelectedTask(card as any)}
      className={`bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gradient-to-r hover:from-blue-400 hover:to-indigo-500 group relative overflow-visible hover:bg-gradient-to-br hover:from-blue-100/40 hover:to-purple-100/40 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transform hover:scale-[1.02] ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Card Cover */}
      {card.cover && (
        <div 
          className="h-16 w-full rounded-t-lg"
          style={getCoverStyle()}
        />
      )}

      {/* Priority Indicator */}
      {card.priority && !card.cover && (
        <div className="absolute top-0 left-0 w-full h-1">
          <div className={`h-full w-full ${getPriorityColor(card.priority)} rounded-t-lg`} />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Header with Menu */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-5 line-clamp-2">
              {card.title}
            </h4>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="relative ml-2"
          >
            <button
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setShowCardMenu(!showCardMenu)
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showCardMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-48 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedTask(card as any)
                    setShowCardMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Card
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTask(card.id)
                    setShowCardMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Card
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.labels.slice(0, 3).map((label, index) => {
              const colors = [
                'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg',
                'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg',
                'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg',
                'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg',
                'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg',
                'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
              ]
              return (
                <span
                  key={index}
                  className={`px-3 py-1.5 text-xs rounded-full font-semibold ${colors[index % colors.length]} transform hover:scale-105 transition-transform`}
                >
                  {label}
                </span>
              )
            })}
            {card.labels.length > 3 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-gray-400 to-slate-500 text-white text-xs rounded-full font-semibold shadow-lg">
                +{card.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar for Subtasks */}
        {totalSubtasks > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {completedSubtasks}/{totalSubtasks} tasks
              </span>
            </div>
            <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 h-2.5 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* Left side - Assignee */}
          <div className="flex items-center">
            {card.assignee && (
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg border-2 border-white dark:border-gray-800 ring-2 ring-purple-100 dark:ring-purple-900">
                {card.assignee.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          
          {/* Right side - Metadata */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {/* Comments */}
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs">{card.comments.length}</span>
              </div>
            )}
            
            {/* Attachments */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span className="text-xs">{card.attachments.length}</span>
              </div>
            )}
            
            {/* Due Date */}
            {card.dueDate && (
              <div className={`flex items-center gap-1 ${
                isOverdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <Calendar className="w-3 h-3" />
                <span className="text-xs">
                  {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showCardMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowCardMenu(false)}
        />
      )}
    </motion.div>
  )
}