import { useEffect, useState } from 'react'

interface ManifestData {
  display?: string
  start_url?: string
  icons?: Array<{ src: string; sizes: string; type: string }>
}

interface PWAStatus {
  isHTTPS: boolean
  hasServiceWorker: boolean
  hasManifest: boolean
  isPWA: boolean
  isInstallable: boolean
  userAgent: string
  manifestData?: ManifestData
  serviceWorkerStatus?: string
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

      // Manifestデータを取得
      let manifestData: ManifestData | undefined = undefined
      try {
        const manifestResponse = await fetch('/manifest.json')
        manifestData = await manifestResponse.json()
      } catch {
        // エラーは無視
      }

      // Service Workerの状態を確認
      let serviceWorkerStatus = 'Not supported'
      if (hasServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            serviceWorkerStatus = registration.active ? 'Active' : 'Registered but not active'
          } else {
            serviceWorkerStatus = 'Not registered'
          }
        } catch {
          serviceWorkerStatus = 'Error checking'
        }
      }

      setStatus({
        isHTTPS,
        hasServiceWorker,
        hasManifest,
        isPWA,
        isInstallable,
        userAgent,
        manifestData,
        serviceWorkerStatus
      })
    }

    checkPWAStatus()
  }, [])

  if (!status) return null

  return (
    <>
      {/* 常に表示するステータスボタン（本番環境でも表示） */}
      <button
        onClick={() => setShowStatus(!showStatus)}
        className="fixed top-2 right-2 z-50 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100"
        title="PWA Status"
      >
        PWA
      </button>

      {showStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">PWA診断</h3>
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
                <span>SW Status:</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {status.serviceWorkerStatus}
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

              {status.manifestData && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div className="mb-2">Manifest設定:</div>
                    <div>Display: {status.manifestData.display}</div>
                    <div>Start URL: {status.manifestData.start_url}</div>
                    <div>Icons: {status.manifestData.icons?.length || 0}個</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="mb-2">User Agent:</div>
                  <div className="break-all">{status.userAgent}</div>
                </div>
              </div>
              
              {status.userAgent.includes('iPhone') && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>iOS Safari インストール手順:</strong><br />
                    1. 画面下部の共有ボタン (□↑) をタップ<br />
                    2. 「ホーム画面に追加」を選択<br />
                    3. 「追加」をタップ<br />
                    4. ホーム画面のアイコンから起動
                  </div>
                </div>
              )}

              {!status.isPWA && status.userAgent.includes('Chrome') && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded">
                  <div className="text-xs text-green-800 dark:text-green-200">
                    <strong>Chrome インストール:</strong><br />
                    アドレスバーの右側にインストールアイコンが表示されます
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