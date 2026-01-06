'use client'

import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
      {themes.map((t) => {
        const IconComponent = t.icon
        return (
          <motion.button
            key={t.value}
            onClick={() => setTheme(t.value as any)}
            className={`px-3 py-1 rounded-md text-sm transition-all relative ${
              theme === t.value 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === t.value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-white dark:bg-gray-600 rounded-md shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-1">
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}