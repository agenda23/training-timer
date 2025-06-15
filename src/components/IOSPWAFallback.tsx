import { useEffect, useState } from 'react'

export const IOSPWAFallback = () => {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isIOSSafari = isIOS && !isInStandaloneMode

    // iOS Safariでブラウザモードの場合、インストール手順を表示
    if (isIOSSafari) {
      const hasSeenInstructions = localStorage.getItem('ios-pwa-instructions-seen')
      if (!hasSeenInstructions) {
        setTimeout(() => {
          setShowIOSInstructions(true)
        }, 3000) // 3秒後に表示
      }
    }
  }, [])

  const handleDismiss = () => {
    setShowIOSInstructions(false)
    localStorage.setItem('ios-pwa-instructions-seen', 'true')
  }

  if (!showIOSInstructions) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            📱 アプリとして使用する
          </h3>
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <div>1. 画面下部の共有ボタン (□↑) をタップ</div>
            <div>2. 「ホーム画面に追加」を選択</div>
            <div>3. 「追加」をタップしてインストール</div>
            <div className="mt-2 text-blue-600 dark:text-blue-300">
              ※ フルスクリーンで快適に使用できます
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
        >
          ✕
        </button>
      </div>
    </div>
  )
} 