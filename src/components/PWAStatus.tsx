import { useEffect, useState } from 'react'

interface PWAStatus {
  isHTTPS: boolean
  hasServiceWorker: boolean
  hasManifest: boolean
  isPWA: boolean
  isInstallable: boolean
  userAgent: string
}

interface SafariNavigator extends Navigator {
  standalone?: boolean
}

export const PWAStatus = () => {
  const [status, setStatus] = useState<PWAStatus | null>(null)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const checkPWAStatus = async () => {
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost'
      const hasServiceWorker = 'serviceWorker' in navigator
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    Boolean('standalone' in navigator && (navigator as SafariNavigator).standalone)
      const isInstallable = 'BeforeInstallPromptEvent' in window
      const userAgent = navigator.userAgent

      setStatus({
        isHTTPS,
        hasServiceWorker,
        hasManifest,
        isPWA,
        isInstallable,
        userAgent
      })
    }

    checkPWAStatus()
  }, [])

  if (!status) return null

  return (
    <>
      {/* 開発環境でのみ表示するステータスボタン */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowStatus(!showStatus)}
          className="fixed top-2 right-2 z-50 bg-blue-500 text-white text-xs px-2 py-1 rounded"
        >
          PWA Status
        </button>
      )}

      {showStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">PWA Status</h3>
              <button
                onClick={() => setShowStatus(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>HTTPS配信:</span>
                <span className={status.isHTTPS ? 'text-green-600' : 'text-red-600'}>
                  {status.isHTTPS ? '✓' : '✗'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Service Worker:</span>
                <span className={status.hasServiceWorker ? 'text-green-600' : 'text-red-600'}>
                  {status.hasServiceWorker ? '✓' : '✗'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Manifest:</span>
                <span className={status.hasManifest ? 'text-green-600' : 'text-red-600'}>
                  {status.hasManifest ? '✓' : '✗'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>PWAモード:</span>
                <span className={status.isPWA ? 'text-green-600' : 'text-orange-600'}>
                  {status.isPWA ? '✓ PWAとして起動中' : '- ブラウザモード'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>インストール可能:</span>
                <span className={status.isInstallable ? 'text-green-600' : 'text-orange-600'}>
                  {status.isInstallable ? '✓' : '-'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="mb-2">User Agent:</div>
                  <div className="break-all">{status.userAgent}</div>
                </div>
              </div>
              
              {status.userAgent.includes('iPhone') && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>iOS Safari:</strong><br />
                    1. 共有ボタン (□↑) をタップ<br />
                    2. 「ホーム画面に追加」を選択<br />
                    3. 「追加」をタップ
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 