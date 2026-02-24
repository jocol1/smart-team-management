import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, Timer, AlertCircle } from "lucide-react";
import { ExportReportButton } from "@/components/export-report-button"; // Import nút vừa tạo

/* ================= TYPES ================= */
interface ProjectFromDB {
  id: string;
  name: string;
  progress: number;
  manager_email: string | null;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

/* ================= PAGE ================= */
export default async function UsersPage() {
  const supabase = await createClient();

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("role", "staff");

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, progress, manager_email");

  const staff = (profilesData as StaffProfile[]) || [];
  const projects = (projectsData as ProjectFromDB[]) || [];

  // Chuẩn bị dữ liệu để xuất Report (tổng hợp từ vòng lặp bên dưới)
  const reportData = staff.map(member => {
    const userProjects = projects.filter(
      (p) => p.manager_email?.trim().toLowerCase() === member.email?.trim().toLowerCase()
    );
    const active = userProjects.filter((p) => p.progress < 100);
    const done = userProjects.filter((p) => p.progress === 100);
    const avgProgress = userProjects.length > 0 
      ? Math.round(userProjects.reduce((acc, p) => acc + p.progress, 0) / userProjects.length) 
      : 0;

    return {
      full_name: member.full_name,
      email: member.email,
      active_projects: active.map(p => p.name).join("; "), // Ngăn cách các dự án bằng dấu chấm phẩy
      completed_count: done.length,
      performance: avgProgress
    };
  });

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <User className="text-blue-600" /> Quản lý nhân sự SmartHub
          </h1>
          <p className="text-slate-500 text-sm">
            Theo dõi khối lượng công việc và hiệu suất của {staff.length} nhân viên.
          </p>
        </div>
        
        {/* Nút Xuất Báo Cáo */}
        <ExportReportButton data={reportData} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          {/* ... TableHeader giữ nguyên như code cũ của bạn ... */}
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[300px] font-bold text-slate-700 pl-8">NHÂN VIÊN</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">DỰ ÁN ĐANG PHỤ TRÁCH</TableHead>
              <TableHead className="font-bold text-slate-700 text-center w-[120px]">ĐÃ XONG</TableHead>
              <TableHead className="font-bold text-slate-700 text-right pr-8 w-[200px]">HIỆU SUẤT TỔNG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length > 0 ? (
              staff.map((member) => {
                const userProjects = projects.filter(
                  (p) => p.manager_email?.trim().toLowerCase() === member.email?.trim().toLowerCase()
                );
                const active = userProjects.filter((p) => p.progress < 100);
                const done = userProjects.filter((p) => p.progress === 100);
                const avgProgress = userProjects.length > 0 ? Math.round(userProjects.reduce((acc, p) => acc + p.progress, 0) / userProjects.length) : 0;

                return (
                  <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase">
                          {member.full_name?.substring(0, 2) || "NS"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight mb-0.5">{member.full_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 justify-center max-w-[400px] mx-auto">
                        {active.length > 0 ? (
                          active.map((p) => (
                            <Badge key={p.id} variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 text-[10px] py-0.5 px-2 font-semibold">
                              <Timer size={10} className="mr-1 opacity-60" /> {p.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic font-medium">Đang sẵn sàng nhận việc</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 font-black text-emerald-600">
                        <CheckCircle size={14} strokeWidth={2.5} />
                        <span>{done.length}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-8">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-black text-slate-700">{avgProgress}%</span>
                        <div className="w-28 bg-slate-100 rounded-full h-2 border border-slate-200 overflow-hidden shadow-inner">
                          <div
                            className={`h-full transition-all duration-700 ${avgProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-24">
                   <div className="flex flex-col items-center gap-3 text-slate-400">
                    <AlertCircle size={48} strokeWidth={1} />
                    <p className="font-medium">Không tìm thấy nhân viên nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}