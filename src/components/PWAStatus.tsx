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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

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
  }, [isClient])

  if (!isClient || !status) return null

  return (
    <>
      {/* PWAステータスボタン - より高いz-indexと明確なスタイル */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '8px', 
          right: '8px', 
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={() => setShowStatus(!showStatus)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          title="PWA Status"
        >
          PWA
        </button>
      </div>

      {showStatus && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>PWA診断</h3>
              <button
                onClick={() => setShowStatus(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>HTTPS配信:</span>
                <span style={{ color: status.isHTTPS ? '#16a34a' : '#dc2626' }}>
                  {status.isHTTPS ? '✓' : '✗'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Service Worker:</span>
                <span style={{ color: status.hasServiceWorker ? '#16a34a' : '#dc2626' }}>
                  {status.hasServiceWorker ? '✓' : '✗'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>SW Status:</span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {status.serviceWorkerStatus}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Manifest:</span>
                <span style={{ color: status.hasManifest ? '#16a34a' : '#dc2626' }}>
                  {status.hasManifest ? '✓' : '✗'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>PWAモード:</span>
                <span style={{ color: status.isPWA ? '#16a34a' : '#ea580c' }}>
                  {status.isPWA ? '✓ PWAとして起動中' : '- ブラウザモード'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>インストール可能:</span>
                <span style={{ color: status.isInstallable ? '#16a34a' : '#ea580c' }}>
                  {status.isInstallable ? '✓' : '-'}
                </span>
              </div>

              {status.manifestData && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <div style={{ marginBottom: '8px' }}>Manifest設定:</div>
                    <div>Display: {status.manifestData.display}</div>
                    <div>Start URL: {status.manifestData.start_url}</div>
                    <div>Icons: {status.manifestData.icons?.length || 0}個</div>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div style={{ marginBottom: '8px' }}>User Agent:</div>
                  <div style={{ wordBreak: 'break-all' }}>{status.userAgent}</div>
                </div>
              </div>
              
              {status.userAgent.includes('iPhone') && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '6px' 
                }}>
                  <div style={{ fontSize: '12px', color: '#1e40af' }}>
                    <strong>iOS Safari インストール手順:</strong><br />
                    1. 画面下部の共有ボタン (□↑) をタップ<br />
                    2. 「ホーム画面に追加」を選択<br />
                    3. 「追加」をタップ<br />
                    4. ホーム画面のアイコンから起動
                  </div>
                </div>
              )}

              {!status.isPWA && status.userAgent.includes('Chrome') && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '6px' 
                }}>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
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