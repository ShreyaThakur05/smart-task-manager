'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit2, Palette, Smile } from 'lucide-react'
import { useSheetStore } from '../store/sheetStore'

const colorOptions = [
  { name: 'blue', class: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'green', class: 'bg-green-500', hover: 'hover:bg-green-600' },
  { name: 'purple', class: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { name: 'red', class: 'bg-red-500', hover: 'hover:bg-red-600' },
  { name: 'orange', class: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { name: 'pink', class: 'bg-pink-500', hover: 'hover:bg-pink-600' },
  { name: 'indigo', class: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
  { name: 'teal', class: 'bg-teal-500', hover: 'hover:bg-teal-600' }
]

const iconOptions = ['💼', '🏠', '📋', '🎯', '💡', '🚀', '📊', '🎨', '⚡', '🔥', '💎', '🌟']

export default function SheetTabs() {
  const { sheets, activeSheetId, addSheet, deleteSheet, updateSheet, setActiveSheet } = useSheetStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSheet, setEditingSheet] = useState<string | null>(null)
  const [newSheetName, setNewSheetName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedIcon, setSelectedIcon] = useState('📋')

  const handleAddSheet = () => {
    if (newSheetName.trim()) {
      addSheet(newSheetName.trim(), selectedColor, selectedIcon)
      setNewSheetName('')
      setSelectedColor('blue')
      setSelectedIcon('📋')
      setShowAddModal(false)
    }
  }

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(c => c.name === color)
    return colorOption ? colorOption.class : 'bg-gray-500'
  }

  const getHoverClass = (color: string) => {
    const colorOption = colorOptions.find(c => c.name === color)
    return colorOption ? colorOption.hover : 'hover:bg-gray-600'
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {sheets.map((sheet) => (
            <motion.button
              key={sheet.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSheet(sheet.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap group relative ${
                activeSheetId === sheet.id
                  ? `${getColorClass(sheet.color)} text-white shadow-lg`
                  : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${getHoverClass(sheet.color)} hover:text-white`
              }`}
            >
              <span className="text-lg">{sheet.icon}</span>
              <span className="font-medium text-sm">{sheet.name}</span>
              
              {sheets.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSheet(sheet.id)
                  }}
                  className="ml-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/20 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.button>
          ))}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Sheet</span>
          </motion.button>
        </div>
      </div>

      {/* Add Sheet Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 z-50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Sheet</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSheet()}
                    placeholder="e.g., Work Projects, Personal Tasks..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Palette className="inline w-4 h-4 mr-1" />
                    Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-8 rounded-lg ${color.class} ${
                          selectedColor === color.name ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        } transition-all hover:scale-105`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Smile className="inline w-4 h-4 mr-1" />
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-lg ${
                          selectedIcon === icon ? 'ring-2 ring-blue-500' : ''
                        } transition-all`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddSheet}
                  disabled={!newSheetName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Sheet
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}