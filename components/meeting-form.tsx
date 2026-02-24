"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Send, Loader2 } from "lucide-react"

// 1. Định nghĩa interface rõ ràng để fix lỗi "Unexpected any"
interface Profile {
  id: string;
  full_name: string;
  email: string;
}

// 2. Sử dụng interface cho props
export function MeetingForm({ profiles }: { profiles: Profile[] }) {
  const [loading, setLoading] = useState(false)

// components/meeting-form.tsx

async function handleSendMeeting(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  
  // 1. LƯU THAM CHIẾU FORM VÀO BIẾN (Quan trọng)
  const form = e.currentTarget; 
  
  setLoading(true);

  const formData = new FormData(form); // Dùng biến 'form' thay vì 'e.currentTarget'
  const title = formData.get("title");
  const email = formData.get("email");
  const date = formData.get("date");
  const time = formData.get("time");

  const GOOGLE_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz7M285D-Ou30XmDOiMHGJAiFsN_krZRJN7IPvlQaBc4L5_vnwAWBcWV7xFfHcvd-v8/exec";
      

  try {
    await fetch(GOOGLE_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "NEW_MEETING",
        title,
        manager_email: email,
        date,
        time
      }),
    });

    alert("Đã gửi lời mời họp qua Gmail thành công!");
    
    // 2. DÙNG BIẾN 'form' ĐỂ RESET
    form.reset(); 
    
  } catch (err) {
    console.error("Lỗi gửi mail:", err);
    alert("Có lỗi xảy ra khi gửi mail.");
  } finally {
    setLoading(false);
  }
}

  return (
    <Card className="lg:col-span-1 shadow-sm border-slate-200 h-fit">
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
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Giờ</Label>
              <Input id="time" name="time" type="time" required />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mt-4 font-bold transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang gửi mail...
              </>
            ) : (
              <>
                <Send size={16} /> Gửi lời mời Gmail
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}