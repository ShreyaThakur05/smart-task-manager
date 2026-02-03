'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Tag, MessageSquare, Paperclip, Plus, Check, Trash2, Edit3 } from 'lucide-react'
import { useTaskStore, type Task } from '../store/taskStore'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  
  const { updateTask, deleteTask } = useTaskStore()

  if (!task) return null

  const handleSave = () => {
    updateTask(task.id, editedTask)
    setIsEditing(false)
    setEditedTask({})
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Current User',
      timestamp: new Date().toISOString()
    }
    
    updateTask(task.id, {
      comments: [...(task.comments || []), comment]
    })
    setNewComment('')
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    
    const subtask = {
      id: Date.now().toString(),
      text: newSubtask,
      completed: false
    }
    
    updateTask(task.id, {
      subtasks: [...(task.subtasks || []), subtask]
    })
    setNewSubtask('')
  }

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    updateTask(task.id, { subtasks: updatedSubtasks })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.title ?? task.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h2>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteTask(task.id)
                    onClose()
                  }}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                    {isEditing ? (
                      <textarea
                        value={editedTask.description ?? task.description ?? ''}
                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={4}
                        placeholder="Add a description..."
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {task.description || 'No description provided.'}
                      </p>
                    )}
                  </div>

                  {/* Subtasks */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Subtasks</h3>
                    <div className="space-y-2">
                      {(task.subtasks || []).map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <button
                            onClick={() => toggleSubtask(subtask.id)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              subtask.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {subtask.completed && <Check className="w-3 h-3" />}
                          </button>
                          <span className={`flex-1 ${
                            subtask.completed
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {subtask.text}
                          </span>
                        </div>
                      ))}
                      
                      {/* Add Subtask */}
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                          placeholder="Add a subtask..."
                          className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handleAddSubtask}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Comments</h3>
                    <div className="space-y-3">
                      {(task.comments || []).map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {comment.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                          placeholder="Add a comment..."
                          className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handleAddComment}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Assignee */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assignee
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {task.assignee?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <span className="text-gray-900 dark:text-white">{task.assignee || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>

                  {/* Labels */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Labels
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                      {task.labels.length === 0 && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No labels</span>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments
                    </h4>
                    {(task.attachments || []).length === 0 ? (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No attachments</span>
                    ) : (
                      <div className="space-y-2">
                        {(task.attachments || []).map((attachment, index) => (
                          <div
                            key={index}
                            className="block p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                          >
                            {attachment}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}