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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
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
          // エラーは無視
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

        setStatus(statusData)
      } catch (error) {
        console.error('Error checking PWA status:', error)
      }
    }

    checkPWAStatus()
  }, [mounted])

  // サーバーサイドレンダリング時は何も表示しない
  if (!mounted || !status) {
    return null
  }

  return (
    <>
      {/* PWAステータスボタン */}
      <button
        onClick={() => setShowStatus(!showStatus)}
        style={{
          position: 'fixed',
          top: '8px',
          right: '8px',
          zIndex: 9999,
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: '12px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500',
          opacity: 0.8,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        title="PWA Status"
      >
        PWA
      </button>

      {showStatus && (
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
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setShowStatus(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>PWA診断</h3>
              <button
                onClick={() => setShowStatus(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>HTTPS配信:</strong></span>
                <span style={{ color: status.isHTTPS ? '#059669' : '#dc2626' }}>
                  {status.isHTTPS ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>Service Worker:</strong></span>
                <span style={{ color: status.hasServiceWorker ? '#059669' : '#dc2626' }}>
                  {status.hasServiceWorker ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>SW Status:</strong></span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {status.serviceWorkerStatus}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>Manifest:</strong></span>
                <span style={{ color: status.hasManifest ? '#059669' : '#dc2626' }}>
                  {status.hasManifest ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>PWAモード:</strong></span>
                <span style={{ color: status.isPWA ? '#059669' : '#f59e0b' }}>
                  {status.isPWA ? '✅ PWAとして起動中' : '⚠️ ブラウザモード'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '8px 0' }}>
                <span><strong>インストール可能:</strong></span>
                <span style={{ color: status.isInstallable ? '#059669' : '#f59e0b' }}>
                  {status.isInstallable ? '✅ Yes' : '⚠️ No'}
                </span>
              </div>

              {status.manifestData && (
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Manifest設定:</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    <div>Display: {status.manifestData.display}</div>
                    <div>Start URL: {status.manifestData.start_url}</div>
                    <div>Icons: {status.manifestData.icons?.length || 0}個</div>
                  </div>
                </div>
              )}
              
              {status.userAgent.includes('iPhone') && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  backgroundColor: '#eff6ff', 
                  borderRadius: '8px',
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                    📱 iOS Safari インストール手順:
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
                    1. 画面下部の共有ボタン (□↑) をタップ<br />
                    2. 「ホーム画面に追加」を選択<br />
                    3. 「追加」をタップ<br />
                    4. ホーム画面のアイコンから起動
                  </div>
                </div>
              )}

              {!status.isPWA && status.userAgent.includes('Chrome') && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: '8px',
                  border: '1px solid #22c55e'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                    🌐 Chrome インストール:
                  </div>
                  <div style={{ fontSize: '13px', color: '#166534' }}>
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