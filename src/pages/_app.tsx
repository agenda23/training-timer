import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>トレーニングタイマー</title>
      </Head>
      <div className="min-h-screen pb-16">
        <Component {...pageProps} />
      </div>
      <Navigation />
    </>
  )
} 