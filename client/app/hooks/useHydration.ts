import { useEffect, useState } from 'react'

/**
 * Custom hook to ensure Zustand stores are hydrated from localStorage
 * This prevents hydration mismatches and ensures persisted state is available
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Set hydrated to true after component mounts (client-side)
    setIsHydrated(true)
  }, [])

  return isHydrated
}
