'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Flag, Tag, Clock, FileText, AlertTriangle, Target, Zap, Paperclip } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStatus?: 'yet-to-start' | 'backlog' | 'in-progress' | 'review' | 'done'
  defaultListId?: string
  sheetId?: string
}

export default function TaskCreateModal({ isOpen, onClose, defaultStatus = 'backlog', defaultListId, sheetId }: TaskCreateModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [status, setStatus] = useState(defaultStatus)
  const [assignee, setAssignee] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [timeEstimate, setTimeEstimate] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [importance, setImportance] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [category, setCategory] = useState('')
  
  const { addTask } = useTaskStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const attachmentNames = attachments.map(file => file.name)
      
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        assignee: assignee.trim() || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        labels: [...labels, ...(timeEstimate ? [`estimate-${timeEstimate}`] : [])],
        attachments: attachmentNames
      }, sheetId)

      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus(defaultStatus)
      setAssignee('')
      setStartDate('')
      setDueDate('')
      setLabels([])
      setNewLabel('')
      setTimeEstimate('')
      setAttachments([])
      setImportance('medium')
      setCategory('')
      
      onClose()
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel('')
    }
  }

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove))
  }

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500', icon: Flag },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', icon: Flag },
    { value: 'high', label: 'High', color: 'bg-orange-500', icon: Flag },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500', icon: AlertTriangle }
  ]

  const importanceOptions = [
    { value: 'low', label: 'Low Impact', color: 'bg-gray-500', icon: Target },
    { value: 'medium', label: 'Medium Impact', color: 'bg-blue-500', icon: Target },
    { value: 'high', label: 'High Impact', color: 'bg-purple-500', icon: Target },
    { value: 'critical', label: 'Critical Impact', color: 'bg-red-600', icon: Zap }
  ]

  const statusOptions = [
    { value: 'yet-to-start', label: 'Yet to Start' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Flag className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Task</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="What needs to be done?"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                    placeholder="Add more details about this task..."
                    rows={4}
                  />
                </div>

              {/* Priority and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <Flag className="inline w-4 h-4 mr-1" />
                    Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorityOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPriority(option.value as any)}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                            priority === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${option.color}`} />
                          <span className="text-sm text-gray-900 dark:text-white">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status and Time Estimate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Estimate */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Time Estimate
                  </label>
                  <select
                    value={timeEstimate}
                    onChange={(e) => setTimeEstimate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select estimate</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="2h">2 hours</option>
                    <option value="4h">4 hours</option>
                    <option value="1d">1 day</option>
                    <option value="2d">2 days</option>
                    <option value="1w">1 week</option>
                    <option value="2w">2 weeks</option>
                  </select>
                </div>
              </div>

              {/* Start Date and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Custom Labels
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {timeEstimate && (
                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm rounded-full">
                      <Clock className="w-3 h-3 mr-1" />
                      {timeEstimate}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add custom label..."
                  />
                  <button
                    type="button"
                    onClick={addLabel}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Paperclip className="inline w-4 h-4 mr-1" />
                  Attachments
                </label>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-900 dark:text-white truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setAttachments([...attachments, ...Array.from(e.target.files)])
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}