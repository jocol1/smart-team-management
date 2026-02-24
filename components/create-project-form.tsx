"use client"
import { useState, useSyncExternalStore } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Mail, Calendar, Table as TableIcon, Rocket, Loader2 } from "lucide-react"

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

const subscribe = () => () => {}

export function CreateProjectForm({ profiles }: { profiles: Profile[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isClient = useSyncExternalStore(subscribe, () => true, () => false)

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const deadline = formData.get("deadline") as string
    const selectedManagerEmail = formData.get("email") as string
    
    const selectedManagerName = profiles.find(p => p.email === selectedManagerEmail)?.full_name || "Nhân sự"

    try {
      // 1. Lưu vào Database Supabase
      const { error: dbError } = await supabase
        .from("projects")
        .insert([{ 
          name, 
          manager_name: selectedManagerName, 
          manager_email: selectedManagerEmail, 
          deadline: deadline,
          status: "pending", 
          progress: 0 
        }])

      if (dbError) throw new Error(dbError.message)

      // 2. Gửi Webhook (Sheets/Gmail)
      const GOOGLE_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz7M285D-Ou30XmDOiMHGJAiFsN_krZRJN7IPvlQaBc4L5_vnwAWBcWV7xFfHcvd-v8/exec";
      
      await fetch(GOOGLE_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          manager_name: selectedManagerName,
          manager_email: selectedManagerEmail,
          deadline: deadline,
          action: "NEW_PROJECT"
        }),
      });

      // 3. Đặt lịch Deadline trên Google Calendar
      const calendarRes = await fetch("/api/sync-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          deadline: deadline,
          manager_email: selectedManagerEmail,
        }),
      });

      if (!calendarRes.ok) {
        const errorData = await calendarRes.json();
        throw new Error(errorData.error || "Lỗi khi đồng bộ lịch");
      }

      setOpen(false)
      router.refresh()
      alert("✅ Đã tạo dự án và đặt lịch thành công!")

    } catch (err: unknown) {
      // FIX LỖI "Unexpected any" TẠI ĐÂY
      console.error("Lỗi:", err);
      const errorMessage = err instanceof Error ? err.message : "Có lỗi không xác định xảy ra";
      alert("❌ " + errorMessage);
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-md transition-all font-semibold">
          <Plus size={18} /> Thêm dự án mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Rocket className="text-blue-600" /> Khởi tạo dự án
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Dữ liệu sẽ được tự động đồng bộ hóa và phân quyền cho nhân viên.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Tên dự án</Label>
            <Input id="name" name="name" placeholder="VD: Thiết kế UI Website mới" required />
          </div>
        
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hạn chót</Label>
            <Input type="date" name="deadline" required className="cursor-pointer" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Người phụ trách</Label>
            <select id="email" name="email" className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm" required>
              <option value="">-- Chọn nhân viên --</option>
              {profiles?.map((staff) => (
                <option key={staff.id} value={staff.email}>{staff.full_name} ({staff.email})</option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg transition-all active:scale-95" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Đang xử lý...</> : "Xác nhận & Giao việc"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}