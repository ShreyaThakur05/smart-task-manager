'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, X } from 'lucide-react'


import { useTaskStore } from '../store/taskStore'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { addTask, lists } = useTaskStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    
    // Enhanced AI parsing with server-side API
    const parseTask = async (text: string) => {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `Parse this task request into JSON format. Available lists: ${lists.map(l => `"${l.title}" (id: ${l.id})`).join(', ')}. Extract: title (clean task name without list references), priority (low/medium/high/urgent), listId (exact list id from available lists, default to 'backlog'), dueDate (YYYY-MM-DD if mentioned), labels (array of relevant tags). Request: "${text}". Return only valid JSON with these exact fields: {"title": "", "priority": "", "listId": "", "dueDate": null, "labels": []}` 
          })
        })
        
        if (!response.ok) throw new Error('API request failed')
        
        const data = await response.json()
        const parsed = JSON.parse(data.candidates[0].content.parts[0].text)
        
        return {
          title: parsed.title || 'New Task',
          description: '',
          priority: parsed.priority || 'medium',
          status: ['backlog', 'in-progress', 'review', 'done'].includes(parsed.listId) ? parsed.listId : 'backlog',
          dueDate: parsed.dueDate,
          labels: parsed.labels || [],
          subtasks: [],
          comments: [],
          attachments: [],
          listId: parsed.listId || 'backlog'
        }
      } catch (error) {
        return parseTaskSimple(text)
      }
    }
    
    const parseTaskSimple = (text: string) => {
      const lowercaseText = text.toLowerCase()
      const allLists = lists // Move this declaration to the top
      
      // Extract task title (look for key phrases)
      let title = text
      const taskKeywords = ['create task', 'add task', 'task', 'homework', 'work', 'project']
      const priorityKeywords = ['high priority', 'low priority', 'urgent', 'important']
      const statusKeywords = ['in backlog', 'backlog', 'in progress', 'review', 'done']
      
      // Clean title by removing command words, dates, and list references
      title = title.replace(/create task|add task|task in|in backlog|backlog list|in progress|progress list|in review|review list|in done|done list|high priority|low priority|urgent|important|deadline|tomorrow|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi, '')
      // Remove list names from title
      for (const list of allLists) {
        const listName = list.title.toLowerCase()
        title = title.replace(new RegExp(`\\b${listName}\\b`, 'gi'), '')
      }
      title = title.replace(/\s+/g, ' ').trim()
      
      // If title is too short or empty, extract meaningful words
      if (title.length < 3) {
        const words = text.split(' ').filter(word => 
          word.length > 2 && 
          !['create', 'task', 'add', 'in', 'with', 'high', 'low', 'priority', 'deadline', 'tomorrow', 'backlog'].includes(word.toLowerCase())
        )
        title = words.join(' ')
      }
      
      title = title.charAt(0).toUpperCase() + title.slice(1) || 'New Task'
      
      // Determine priority
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
      if (lowercaseText.includes('urgent') || lowercaseText.includes('asap')) priority = 'urgent'
      else if (lowercaseText.includes('high') || lowercaseText.includes('important')) priority = 'high'
      else if (lowercaseText.includes('low') || lowercaseText.includes('minor')) priority = 'low'
      
      // Determine status based on list mentions
      let status: 'backlog' | 'in-progress' | 'review' | 'done' = 'backlog'
      
      // Check for specific list mentions (including user-created lists)
      let matchedListId = 'backlog' // default
      
      for (const list of allLists) {
        const listTitle = list.title.toLowerCase()
        if (lowercaseText.includes(`in ${listTitle}`) || lowercaseText.includes(`${listTitle} list`) || lowercaseText.includes(`task in ${listTitle}`) || lowercaseText.includes(`add`) && lowercaseText.includes(listTitle)) {
          matchedListId = list.id
          break
        }
      }
      
      // Map list ID to status (for user-created lists, use backlog as default status)
      const statusMap: { [key: string]: 'backlog' | 'in-progress' | 'review' | 'done' } = {
        'backlog': 'backlog',
        'in-progress': 'in-progress',
        'review': 'review', 
        'done': 'done'
      }
      
      // For user-created lists, we need to store the list ID separately
      // and use backlog as the status since tasks can only have 4 statuses
      const finalStatus = statusMap[matchedListId] || 'backlog'
      
      // Extract labels first
      const labels: string[] = []
      if (lowercaseText.includes('bug') || lowercaseText.includes('fix')) labels.push('bug')
      if (lowercaseText.includes('feature') || lowercaseText.includes('new')) labels.push('feature')
      if (lowercaseText.includes('ui') || lowercaseText.includes('design')) labels.push('ui')
      if (lowercaseText.includes('backend') || lowercaseText.includes('api')) labels.push('backend')
      if (lowercaseText.includes('homework') || lowercaseText.includes('math')) labels.push('homework')
      
      // Extract deadline with date parsing
      let dueDate = undefined
      const dateMatch = lowercaseText.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/)
      if (dateMatch) {
        const day = parseInt(dateMatch[1])
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const month = monthNames.indexOf(dateMatch[2])
        const currentYear = new Date().getFullYear()
        const date = new Date(currentYear, month, day)
        dueDate = date.toISOString().split('T')[0]
      } else if (lowercaseText.includes('tomorrow') || lowercaseText.includes('deadline tomorrow')) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        dueDate = tomorrow.toISOString().split('T')[0]
      }
      
      return {
        title,
        description: '',
        priority,
        status: finalStatus,
        dueDate,
        labels,
        subtasks: [],
        comments: [],
        attachments: [],
        listId: matchedListId
      }
    }

    try {
      const taskData = await parseTask(input)
      addTask(taskData)
      setInput('')
      
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false)
        onClose()
      }, 1000)
    } catch (error) {
      setIsProcessing(false)
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
            className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create tasks with natural language</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Try saying things like:
                </p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>• "Create a high priority bug fix for login issues"</p>
                  <p>• "Add a new feature for user profiles"</p>
                  <p>• "Start working on the dashboard UI design"</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the task you want to create..."
                    className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Creating your task...</span>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}