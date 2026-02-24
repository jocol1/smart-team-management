import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server' // Bạn cần tạo thêm file server.ts tương tự client.ts nhưng dùng createServerClient

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}