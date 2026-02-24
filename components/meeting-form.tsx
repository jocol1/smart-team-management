"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Send, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client" 
import { useRouter } from "next/navigation" 

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export function MeetingForm({ profiles }: { profiles: Profile[] }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient() 
  const router = useRouter()

  async function handleSendMeeting(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; 
    setLoading(true);

    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const email = formData.get("email") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const attendee = profiles.find(p => p.email === email);
    const GOOGLE_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz7M285D-Ou30XmDOiMHGJAiFsN_krZRJN7IPvlQaBc4L5_vnwAWBcWV7xFfHcvd-v8/exec";

    try {
      // BƯỚC 1: LƯU VÀO SUPABASE
      const { error: dbError } = await supabase
        .from("meetings")
        .insert([
          {
            title: title,
            attendee_email: email,
            date: date,
            time: time,
            status: "scheduled",
          }
        ]);

      if (dbError) throw dbError;

      // BƯỚC 2: GỬI WEBHOOK GOOGLE SCRIPT (Gửi mail)
      await fetch(GOOGLE_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "NEW_MEETING",
          title: title,
          manager_email: email,
          attendee_name: attendee?.full_name || "Nhân viên",
          date: date,
          time: time
        }),
      });

      // BƯỚC 3: GỌI API LOCAL ĐỂ ĐẶT LỊCH (ĐÂY LÀ PHẦN MỚI)
      await fetch("/api/sync-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          deadline: date, 
          manager_email: email,
        }),
      });

      alert("Đã lưu lịch họp, gửi Gmail và đặt lịch Google thành công!");
      
      form.reset(); 
      router.refresh(); 
      
    } catch (err: unknown) { 
      console.error("Lỗi tổng thể:", err);
      const errorMessage = err instanceof Error ? err.message : "Không thể gửi yêu cầu";
      alert("Có lỗi xảy ra: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    // ... Phần JSX (Return) giữ nguyên như cũ của bạn ...
    <Card className="lg:col-span-1 shadow-sm border-slate-200 h-fit">
       {/* (Giữ nguyên phần Form bên dưới) */}
       <CardHeader className="border-b bg-white">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} /> Đặt lịch họp mới
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSendMeeting} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề cuộc họp</Label>
            <Input id="title" name="title" placeholder="VD: Review dự án tuần 4" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Nhân viên tham gia</Label>
            <select 
              id="email"
              name="email" 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.email}>
                  {p.full_name} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input id="date" name="date" type="date" required className="cursor-pointer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Giờ</Label>
              <Input id="time" name="time" type="time" required className="cursor-pointer" />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mt-4 font-bold transition-all active:scale-95 shadow-md shadow-blue-100"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={16} /> Đang xử lý...</>
            ) : (
              <><Send size={16} /> Xác nhận & Gửi mail</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}