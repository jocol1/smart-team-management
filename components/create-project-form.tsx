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
import { Plus, Mail, Calendar, Table as TableIcon, Rocket } from "lucide-react"

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
    const selectedManagerEmail = formData.get("email") as string
    
    // Tìm tên nhân viên tương ứng với email đã chọn
    const selectedManagerName = profiles.find(p => p.email === selectedManagerEmail)?.full_name || "Nhân sự"

    // 1. Lưu vào Database
    const { error } = await supabase
      .from("projects")
      .insert([{ 
        name, 
        manager_name: selectedManagerName, 
        manager_email: selectedManagerEmail, 
        status: "pending", 
        progress: 0 
      }])

    if (!error) {
      // 2. Gửi Webhook sang Google Script (URL bạn đã cung cấp)
      const GOOGLE_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz7M285D-Ou30XmDOiMHGJAiFsN_krZRJN7IPvlQaBc4L5_vnwAWBcWV7xFfHcvd-v8/exec";
      
      try {
        await fetch(GOOGLE_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            manager_name: selectedManagerName,
            manager_email: selectedManagerEmail,
            action: "NEW_PROJECT"
          }),
        });
      } catch (err) {
        console.error("Lỗi đồng bộ Workspace:", err);
      }

      setOpen(false)
      router.refresh()
    } else {
      alert("Lỗi khi tạo dự án: " + error.message)
    }
    setLoading(false)
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
          {/* Ô NHẬP TÊN DỰ ÁN */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Tên dự án</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="VD: Thiết kế UI Website mới" 
              className="h-11 focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          
          {/* Ô CHỌN NHÂN VIÊN */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Người phụ trách (Staff)</Label>
            <select 
              id="email" 
              name="email" 
              className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
              required
            >
              <option value="">-- Click để chọn nhân viên --</option>
              {profiles && profiles.length > 0 ? (
                profiles.map((staff) => (
                  <option key={staff.id} value={staff.email}>
                    {staff.full_name} ({staff.email})
                  </option>
                ))
              ) : (
                <option disabled>Chưa có dữ liệu nhân viên</option>
              )}
            </select>
            <p className="text-[11px] text-slate-400 italic">Nhân viên sẽ nhận được email và quyền quản lý tiến độ.</p>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Hệ sinh thái đồng bộ</p>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5"><TableIcon size={14} className="text-green-600" /> Sheets</div>
              <div className="flex items-center gap-1.5"><Mail size={14} className="text-red-500" /> Gmail</div>
              <div className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> Calendar</div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg shadow-blue-200 transition-all active:scale-95" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Đang xử lý...
              </span>
            ) : (
              "Xác nhận & Giao việc"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}