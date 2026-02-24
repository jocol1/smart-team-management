'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SmartHub</CardTitle>
          <CardDescription>Đăng nhập để quản lý Workspace của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLogin} 
            className="w-full py-6 text-lg font-medium" 
            variant="outline"
          >
            <img src="https://www.google.com/favicon.ico" className="mr-2 h-5 w-5" alt="google" />
            Tiếp tục với Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}