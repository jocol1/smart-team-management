"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client" // Dùng client component client
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    // Hiện thông báo xác nhận để tránh sếp lỡ tay xóa nhầm
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa dự án này? Thao tác này không thể hoàn tác.")
    if (!confirmDelete) return

    setIsDeleting(true)
    
    // Thực hiện xóa dòng có ID tương ứng trong bảng projects
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Lỗi khi xóa: " + error.message)
    } else {
      // Làm mới dữ liệu trên trang mà không cần F5
      router.refresh()
    }
    
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
      title="Xóa dự án"
    >
      <Trash2 size={18} className={isDeleting ? "animate-pulse" : ""} />
    </Button>
  )
}