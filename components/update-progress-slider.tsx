"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner" 

interface UpdateProgressSliderProps {
  id: string;
  currentProgress: number;
}

export function UpdateProgressSlider({ 
  id, 
  currentProgress 
}: UpdateProgressSliderProps) {
  const [value, setValue] = useState([currentProgress])
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async (newValue: number[]) => {
    const progress = newValue[0]
    setIsUpdating(true)
    setValue(newValue)

    try {
      // CHỈ GỌI .update() MỘT LẦN DUY NHẤT
      // Logic: Nếu 100% thì tự chuyển status sang 'done'
      const updatePayload = progress === 100 
        ? { progress, status: 'done' } 
        : { progress };

      const { error } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      if (progress === 100) {
        toast.success("Tuyệt vời! Dự án đã hoàn thành 100%");
      }
      
      router.refresh();
    } catch (err: unknown) {
      console.error("Lỗi cập nhật:", err);
      const msg = err instanceof Error ? err.message : "Không thể cập nhật tiến độ";
      toast.error(msg);
      setValue([currentProgress]); // Reset về giá trị cũ nếu lỗi
    } finally {
      setIsUpdating(false);
    }
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
      <span className={`text-[10px] min-w-[35px] text-center font-bold px-1.5 py-0.5 rounded transition-colors ${
        isUpdating ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-500'
      }`}>
        {value[0]}%
      </span>
    </div>
  )
}