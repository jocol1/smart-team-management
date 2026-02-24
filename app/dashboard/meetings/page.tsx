import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Video, CalendarDays, UserCheck, AlertCircle } from "lucide-react";
import { MeetingForm } from "@/components/meeting-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Lấy thông tin profile người dùng hiện tại
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // 2. Lấy danh sách nhân viên để Admin chọn trong Form
  const { data: staffProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'staff');

  // 3. Truy vấn danh sách cuộc họp
  // Nếu là Staff, có thể bạn muốn lọc chỉ hiện cuộc họp của họ: .eq('attendee_email', user?.email)
  let query = supabase.from('meetings').select('*');
  
  if (!isAdmin && user?.email) {
    query = query.eq('attendee_email', user.email);
  }

  const { data: meetings } = await query
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarDays className="text-blue-600" /> 
            {isAdmin ? "Quản lý lịch họp hệ thống" : "Lịch họp của tôi"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin 
              ? "Điều phối lịch họp và đồng bộ hóa với Google Calendar của nhân sự." 
              : "Danh sách các buổi họp bạn đã được mời tham gia."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM ĐẶT LỊCH HOẶC CARD THÔNG TIN */}
        <div className="lg:col-span-1 space-y-6">
          {isAdmin ? (
            <MeetingForm profiles={staffProfiles || []} />
          ) : (
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="p-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm">
                  <Video className="text-white" size={40} />
                </div>
                <h3 className="font-bold text-xl">Lịch họp Gmail</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Hệ thống sẽ tự động gửi lời mời và tạo sự kiện trên Google Calendar của bạn. Hãy kiểm tra điện thoại để nhận thông báo nhắc hẹn.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Card phụ hiển thị số lượng */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Cuộc họp sắp tới</p>
                <p className="text-2xl font-bold text-slate-900">{meetings?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: DANH SÁCH LỊCH HỌP */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50 py-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Chi tiết lịch trình
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Sắp diễn ra
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {meetings && meetings.length > 0 ? (
                meetings.map((m) => (
                  <div key={m.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/80 transition-all group gap-4">
                    <div className="flex gap-5">
                      <div className="bg-slate-100 p-3.5 rounded-xl text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors hidden sm:block">
                        <Clock size={28} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">
                          {m.title}
                        </h4>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="font-medium text-slate-400">Người tham gia:</span> 
                            <span className="text-blue-600 font-semibold">{m.attendee_email}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-[11px] bg-white text-slate-700 px-3 py-1 rounded-md font-bold border border-slate-200 shadow-sm flex items-center gap-1">
                            📅 {m.date}
                          </span>
                          <span className="text-[11px] bg-white text-slate-700 px-3 py-1 rounded-md font-bold border border-slate-200 shadow-sm flex items-center gap-1">
                            ⏰ {m.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border-slate-200 font-bold">
                      Xem chi tiết
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <AlertCircle className="text-slate-300" size={40} />
                  </div>
                  <h3 className="text-slate-900 font-bold">Chưa có lịch họp</h3>
                  <p className="text-slate-400 text-sm max-w-[250px] mx-auto mt-2">
                    Các cuộc họp mới sẽ xuất hiện tại đây sau khi Admin tạo lịch trình.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}