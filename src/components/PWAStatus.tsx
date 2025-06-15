import { useEffect, useState } from 'react'

interface ManifestData {
  display?: string
  start_url?: string
  icons?: Array<{ src: string; sizes: string; type: string }>
}

interface PWAStatusData {
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

interface PWAStatusProps {
  forceShow?: boolean
  onClose?: () => void
}

export const PWAStatus = ({ forceShow = false, onClose }: PWAStatusProps = {}) => {
  const [pwaData, setPwaData] = useState<PWAStatusData | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // forceShowが変更されたときの処理
  useEffect(() => {
    if (forceShow) {
      setShowStatus(true)
    }
  }, [forceShow])

  // ダイアログを閉じる処理
  const handleClose = () => {
    setShowStatus(false)
    if (onClose) {
      onClose()
    }
  }

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

        setPwaData(statusData)
      } catch (error) {
        console.error('Error checking PWA status:', error)
      }
    }

    checkPWAStatus()
  }, [mounted])

  // Service Workerの更新を監視
  useEffect(() => {
    if (!mounted || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          // 更新をチェック
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })

          // 既に待機中のService Workerがある場合
          if (registration.waiting) {
            setUpdateAvailable(true)
          }

          // 定期的に更新をチェック
          await registration.update()
        }
      } catch (error) {
        console.error('Service Worker update check failed:', error)
      }
    }

    checkForUpdates()
    
    // 5分ごとに更新をチェック
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [mounted])

  // PWAリロード機能
  const handlePWAReload = async () => {
    setIsReloading(true)
    setUpdateAvailable(false) // 更新状態をリセット
    
    try {
      // Service Workerの更新を強制
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          
          // 新しいService Workerがある場合は強制的にアクティベート
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      }

      // キャッシュをクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }

      // 少し待ってからリロード
      setTimeout(() => {
        window.location.reload()
      }, 500)
      
    } catch (error) {
      console.error('PWA reload failed:', error)
      setIsReloading(false)
      setUpdateAvailable(false)
      // エラーが発生した場合でも通常のリロードを実行
      window.location.reload()
    }
  }

  // 通常のリロード
  const handleNormalReload = () => {
    window.location.reload()
  }

  // サーバーサイドレンダリング時は何も表示しない
  if (!mounted || !pwaData) {
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
          backgroundColor: updateAvailable ? '#f59e0b' : '#3b82f6',
          color: 'white',
          fontSize: '12px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500',
          opacity: 0.8,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        title={updateAvailable ? "PWA Status - 更新利用可能!" : "PWA Status"}
      >
        PWA {updateAvailable && '🔄'}
        {updateAvailable && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '1px solid white',
              display: 'inline-block'
            }}
          />
        )}
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
          onClick={handleClose}
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
                onClick={handleClose}
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
                <span style={{ color: pwaData.isHTTPS ? '#059669' : '#dc2626' }}>
                  {pwaData.isHTTPS ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>Service Worker:</strong></span>
                <span style={{ color: pwaData.hasServiceWorker ? '#059669' : '#dc2626' }}>
                  {pwaData.hasServiceWorker ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>SW Status:</strong></span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {pwaData.serviceWorkerStatus}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>Manifest:</strong></span>
                <span style={{ color: pwaData.hasManifest ? '#059669' : '#dc2626' }}>
                  {pwaData.hasManifest ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span><strong>PWAモード:</strong></span>
                <span style={{ color: pwaData.isPWA ? '#059669' : '#f59e0b' }}>
                  {pwaData.isPWA ? '✅ PWAとして起動中' : '⚠️ ブラウザモード'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '8px 0' }}>
                <span><strong>インストール可能:</strong></span>
                <span style={{ color: pwaData.isInstallable ? '#059669' : '#f59e0b' }}>
                  {pwaData.isInstallable ? '✅ Yes' : '⚠️ No'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '8px 0' }}>
                <span><strong>更新状態:</strong></span>
                <span style={{ color: updateAvailable ? '#f59e0b' : '#059669' }}>
                  {updateAvailable ? '🔄 更新利用可能' : '✅ 最新版'}
                </span>
              </div>

              {pwaData.manifestData && (
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Manifest設定:</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    <div>Display: {pwaData.manifestData.display}</div>
                    <div>Start URL: {pwaData.manifestData.start_url}</div>
                    <div>Icons: {pwaData.manifestData.icons?.length || 0}個</div>
                  </div>
                </div>
              )}
              
              {pwaData.userAgent.includes('iPhone') && (
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

              {!pwaData.isPWA && pwaData.userAgent.includes('Chrome') && (
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

            {/* リロードボタン */}
            <div style={{ 
              marginTop: '24px', 
              paddingTop: '20px', 
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handlePWAReload}
                disabled={isReloading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isReloading ? 'not-allowed' : 'pointer',
                  opacity: isReloading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (!isReloading) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isReloading) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {isReloading ? '🔄' : '🔄'} PWAリロード
              </button>
              
              <button
                onClick={handleNormalReload}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280'
                }}
              >
                🔄 通常リロード
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 