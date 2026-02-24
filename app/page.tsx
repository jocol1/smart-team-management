import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <span className="font-bold text-xl text-blue-600">ProManager AI</span>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost">Đăng nhập</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Dùng thử ngay</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
                Quản lý dự án thông minh <br /> cho doanh nghiệp 4.0
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl">
                Tối ưu quy trình làm việc, theo dõi tiến độ thời gian thực và tự động hóa báo cáo chỉ trong một nền tảng.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                    Bắt đầu ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold">Real-time Data</h3>
                <p className="text-slate-500 text-center">Dữ liệu cập nhật tức thì qua Supabase, không cần tải lại trang.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold">Phân quyền chặt chẽ</h3>
                <p className="text-slate-500 text-center">Hệ thống RBAC bảo mật, phân định rõ vai trò Admin và Nhân viên.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold">Google Workspace</h3>
                <p className="text-slate-500 text-center">Kết nối trực tiếp với Google Sheets để xuất báo cáo tự động.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t bg-white">
        <div className="container px-4 md:px-6 mx-auto flex justify-between items-center text-sm text-slate-500">
          <p>© 2026 ProManager AI. Phát triển bởi [Tên Bạn].</p>
        </div>
      </footer>
    </div>
  );
}