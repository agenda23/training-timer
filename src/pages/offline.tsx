import Head from 'next/head'

export default function Offline() {
  return (
    <>
      <Head>
        <title>オフライン - トレーニングタイマー</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          オフラインです
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          インターネット接続を確認してください。
          <br />
          接続が回復したら自動的に再接続します。
        </p>
      </div>
    </>
  )
} 