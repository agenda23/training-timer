import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className} touch-none`}>
      <Head>
        <title>トレーニングタイマー</title>
      </Head>
      <style jsx global>{`
        html, body {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
      `}</style>
      <Component {...pageProps} />
    </main>
  )
} 