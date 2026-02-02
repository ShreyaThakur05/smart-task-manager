'use client'

import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <motion.div
                key={j}
                className="h-16 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: j * 0.2 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}