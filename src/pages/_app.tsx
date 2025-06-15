import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter } from 'next/font/google'
// import { Navigation } from '@/components/Navigation'
// import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
// import { PWAStatus } from '@/components/PWAStatus'
// import { IOSPWAFallback } from '@/components/IOSPWAFallback'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className} style={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
      <Head>
        <title>トレーニングタイマー</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
      </Head>
      {/* <PWAInstallPrompt /> */}
      {/* <PWAStatus /> */}
      {/* <IOSPWAFallback /> */}
      <Component {...pageProps} />
      {/* <Navigation /> */}
    </div>
  )
} 