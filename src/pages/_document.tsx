import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* 基本的なメタ情報 */}
        <meta name="application-name" content="トレーニングタイマー" />
        <meta name="description" content="シンプルで使いやすいインターバルトレーニングタイマー" />
        <meta name="theme-color" content="#ef4444" />

        
        {/* PWA設定 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* iOS専用設定 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="トレーニングタイマー" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* その他の設定 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#ef4444" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* iOS専用のアイコン設定 */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* 標準的なアイコン設定 */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* iOS専用のスプラッシュスクリーン設定 */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 