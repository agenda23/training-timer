import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Accept-Languageヘッダーを確認
  const acceptLanguage = request.headers.get('accept-language')
  
  // デフォルトで日本語を設定
  request.headers.set('x-locale', 'ja')
  
  // ブラウザの言語設定が日本語以外の場合でも、現時点では日本語のみ対応
  if (acceptLanguage && !acceptLanguage.includes('ja')) {
    console.log('Browser language is not Japanese, but only Japanese is supported now.')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
} 