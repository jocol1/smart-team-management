"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportData {
  full_name: string | null;
  email: string | null;
  active_projects: string;
  completed_count: number;
  performance: number;
}

export function ExportReportButton({ data }: { data: ExportData[] }) {
  const handleExport = () => {
    // 1. Định nghĩa Header
    const headers = ["Nhân viên", "Email", "Dự án đang làm", "Đã xong", "Hiệu suất (%)"];
    
    // 2. Chuyển dữ liệu thành các dòng CSV
    const csvRows = data.map(item => [
      `"${item.full_name || "N/A"}"`,
      `"${item.email || ""}"`,
      `"${item.active_projects}"`,
      item.completed_count,
      `${item.performance}%`
    ].join(","));

    // 3. Kết hợp Header và Body (Thêm BOM \uFEFF để hiển thị đúng tiếng Việt trong Excel/Sheets)
    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    
    // 4. Tạo file và tải về
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_cao_nhan_su_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleExport}
      variant="outline" 
      className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
    >
      <FileSpreadsheet size={18} />
      Xuất Report Sheets
    </Button>
  );
}