import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface SafariNavigator extends Navigator {
  standalone?: boolean
}

export const Navigation = () => {
  const router = useRouter()
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // PWAとして起動されているかどうかを確認
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isAppleStandalone = ('standalone' in navigator) && (navigator as SafariNavigator).standalone
    setIsPWA(isStandalone || !!isAppleStandalone)
  }, [])

  if (!isPWA) return null

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-12 h-12 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={handleRefresh}
        className="flex items-center justify-center w-12 h-12 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    </div>
  )
} 