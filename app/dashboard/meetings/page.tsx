import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Video } from "lucide-react";
import { MeetingForm } from "@/components/meeting-form"; // Chúng ta sẽ tạo file này

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Lấy role của user
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  // 2. Lấy danh sách nhân viên để Admin chọn trong Form
  const { data: staffProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'staff');

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lịch họp & Thông báo</h1>
        <p className="text-slate-500 mt-1">Điều phối lịch họp và thông báo tự động qua Gmail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM ĐẶT LỊCH */}
        {isAdmin ? (
          <MeetingForm profiles={staffProfiles || []} />
        ) : (
          <Card className="lg:col-span-1 bg-blue-50 border-blue-100">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="p-3 bg-white rounded-full w-fit mx-auto shadow-sm">
                <Video className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-blue-900">Thông báo họp</h3>
              <p className="text-sm text-blue-700">
                Mọi lời mời họp sẽ được gửi trực tiếp vào Gmail của bạn.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CỘT PHẢI: DANH SÁCH LỊCH HỌP (Mẫu) */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg">Danh sách cuộc họp sắp tới</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Họp triển khai hệ thống</h4>
                    <p className="text-sm text-slate-500">Người mời: Admin</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">Hôm nay</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">14:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}