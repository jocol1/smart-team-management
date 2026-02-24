"use client"

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface UpdateStatusSelectProps {
  id: string;
  currentStatus: string;
}

export function UpdateStatusSelect({ id, currentStatus }: UpdateStatusSelectProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (newStatus: string) => {
    // 1. Gom tất cả dữ liệu cần update vào 1 object duy nhất
    // Nếu chọn 'done', tự động đẩy progress lên 100%
    const updatePayload = newStatus === 'done'
      ? { status: newStatus, progress: 100 }
      : { status: newStatus };

    try {
      // 2. Chỉ gọi .update() MỘT LẦN
      const { error } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Đã cập nhật: ${newStatus === 'done' ? 'Hoàn thành' : 'Trạng thái mới'}`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Lỗi cập nhật trạng thái:", err);
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error("Không thể cập nhật: " + msg);
    }
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleUpdate}>
      <SelectTrigger className="w-[140px] h-9 text-xs font-semibold bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending" className="text-slate-600 font-medium">
          ● Chờ xử lý
        </SelectItem>
        <SelectItem value="in-progress" className="text-amber-600 font-medium">
          ● Đang làm
        </SelectItem>
        <SelectItem value="done" className="text-emerald-600 font-medium">
          ● Hoàn thành
        </SelectItem>
      </SelectContent>
    </Select>
  )
}