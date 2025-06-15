import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <Head>
        <title>トレーニングタイマー</title>
      </Head>
      <div className="min-h-screen pb-16 touch-none">
        <Component {...pageProps} />
      </div>
      <Navigation />
    </div>
  )
} 