import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Lấy trang mà người dùng muốn quay lại (mặc định là dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // THAY ĐỔI QUAN TRỌNG: Phải đợi đổi mã thành công mới cho đi tiếp
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Nếu thành công, về trang dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Nếu lỗi (mã code hết hạn hoặc sai), đẩy về trang login kèm thông báo lỗi
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
