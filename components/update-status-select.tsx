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

export function UpdateStatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (newStatus: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      router.refresh()
    }
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleUpdate}>
      <SelectTrigger className="w-[130px] h-8 text-xs font-medium border-none shadow-none focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Chờ xử lý</SelectItem>
        <SelectItem value="in-progress">Đang làm</SelectItem>
        <SelectItem value="done">Hoàn thành</SelectItem>
      </SelectContent>
    </Select>
  )
}