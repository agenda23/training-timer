import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { PWAStatus } from '@/components/PWAStatus'
import { IOSPWAFallback } from '@/components/IOSPWAFallback'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <Head>
        <title>トレーニングタイマー</title>
      </Head>
      <PWAInstallPrompt />
      <PWAStatus />
      <IOSPWAFallback />
      <div className="min-h-screen pb-16 touch-none">
        <Component {...pageProps} />
      </div>
      <Navigation />
    </div>
  )
} 