"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner" // Hoặc useToast của shadcn

export function UpdateProgressSlider({ 
  id, 
  currentProgress 
}: { 
  id: string, 
  currentProgress: number 
}) {
  const [value, setValue] = useState([currentProgress])
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async (newValue: number[]) => {
    setIsUpdating(true)
    setValue(newValue)

    const { error } = await supabase
      .from('projects')
      .update({ progress: newValue[0] })
      .eq('id', id)

    if (error) {
      toast.error("Không thể cập nhật tiến độ")
      setValue([currentProgress]) // Reset về giá trị cũ nếu lỗi
    } else {
      // Nếu đạt 100%, bạn có thể kích hoạt thêm logic chúc mừng ở đây
      if (newValue[0] === 100) {
        toast.success("Tuyệt vời! Dự án đã hoàn thành 100%")
      }
      router.refresh()
    }
    setIsUpdating(false)
  }

  return (
    <div className="group relative flex items-center w-full gap-4">
      <Slider
        defaultValue={[currentProgress]}
        max={100}
        step={5}
        value={value}
        onValueChange={setValue}
        onValueCommit={handleUpdate} // Chỉ gọi database khi người dùng thả chuột
        disabled={isUpdating}
        className="cursor-pointer"
      />
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
        isUpdating ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-500'
      }`}>
        {value[0]}%
      </span>
    </div>
  )
}