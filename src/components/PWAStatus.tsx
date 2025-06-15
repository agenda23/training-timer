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
  const [mounted, setMounted] = useState(false)

  // マウント状態を管理
  useEffect(() => {
    setMounted(true)
    console.log('PWAStatus component mounted')
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log('Starting PWA status check...')
    
    const checkPWAStatus = async () => {
      try {
        const isHTTPS = typeof window !== 'undefined' && (location.protocol === 'https:' || location.hostname === 'localhost')
        const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
        const hasManifest = typeof document !== 'undefined' && document.querySelector('link[rel="manifest"]') !== null
        const isPWA = typeof window !== 'undefined' && (
          window.matchMedia('(display-mode: standalone)').matches || 
          Boolean('standalone' in navigator && (navigator as SafariNavigator).standalone)
        )
        const isInstallable = typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'

        // Manifestデータを取得
        let manifestData: ManifestData | undefined = undefined
        try {
          const manifestResponse = await fetch('/manifest.json')
          manifestData = await manifestResponse.json()
        } catch {
          console.log('Failed to fetch manifest')
        }

        // Service Workerの状態を確認
        let serviceWorkerStatus = 'Not supported'
        if (hasServiceWorker && typeof navigator !== 'undefined') {
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

        const statusData = {
          isHTTPS,
          hasServiceWorker,
          hasManifest,
          isPWA,
          isInstallable,
          userAgent,
          manifestData,
          serviceWorkerStatus
        }

        console.log('PWA Status:', statusData)
        setStatus(statusData)
      } catch (error) {
        console.error('Error checking PWA status:', error)
      }
    }

    checkPWAStatus()
  }, [mounted])

  // サーバーサイドレンダリング時は何も表示しない
  if (!mounted) {
    return null
  }

  console.log('Rendering PWAStatus, mounted:', mounted, 'status:', status)

  return (
    <>
      {/* デバッグ用の表示 */}
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 99999,
          backgroundColor: '#ff0000',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}
      >
        PWA Debug: {mounted ? 'Mounted' : 'Not Mounted'}
      </div>

      {/* PWAステータスボタン */}
      <button
        onClick={() => {
          console.log('PWA button clicked')
          setShowStatus(!showStatus)
        }}
        style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          zIndex: 99998,
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: '14px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        title="PWA Status"
      >
        PWA Status
      </button>

      {showStatus && status && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99997,
            padding: '20px'
          }}
          onClick={() => setShowStatus(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0' }}>PWA診断結果</h3>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>HTTPS配信:</strong> {status.isHTTPS ? '✅ Yes' : '❌ No'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Service Worker:</strong> {status.hasServiceWorker ? '✅ Yes' : '❌ No'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>SW Status:</strong> {status.serviceWorkerStatus}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Manifest:</strong> {status.hasManifest ? '✅ Yes' : '❌ No'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>PWAモード:</strong> {status.isPWA ? '✅ PWAとして起動中' : '⚠️ ブラウザモード'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>インストール可能:</strong> {status.isInstallable ? '✅ Yes' : '⚠️ No'}
              </div>

              {status.manifestData && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                  <strong>Manifest設定:</strong><br />
                  Display: {status.manifestData.display}<br />
                  Start URL: {status.manifestData.start_url}<br />
                  Icons: {status.manifestData.icons?.length || 0}個
                </div>
              )}
              
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '6px' }}>
                <strong>User Agent:</strong><br />
                <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{status.userAgent}</div>
              </div>
              
              {status.userAgent.includes('iPhone') && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '6px',
                  border: '1px solid #2196f3'
                }}>
                  <strong>📱 iOS Safari インストール手順:</strong><br />
                  1. 画面下部の共有ボタン (□↑) をタップ<br />
                  2. 「ホーム画面に追加」を選択<br />
                  3. 「追加」をタップ<br />
                  4. ホーム画面のアイコンから起動
                </div>
              )}

              {!status.isPWA && status.userAgent.includes('Chrome') && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: '6px',
                  border: '1px solid #4caf50'
                }}>
                  <strong>🌐 Chrome インストール:</strong><br />
                  アドレスバーの右側にインストールアイコンが表示されます
                </div>
              )}
            </div>

            <button
              onClick={() => setShowStatus(false)}
              style={{
                marginTop: '20px',
                backgroundColor: '#666',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
} 