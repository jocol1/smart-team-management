import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, Timer, AlertCircle, Mail, Shield } from "lucide-react";
import { ExportReportButton } from "@/components/export-report-button";

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

  // Lấy dữ liệu Profile và Projects song song để tối ưu tốc độ
  const [profilesResponse, projectsResponse] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, role").eq("role", "staff"),
    supabase.from("projects").select("id, name, progress, manager_email")
  ]);

  const staff = (profilesResponse.data as StaffProfile[]) || [];
  const projects = (projectsResponse.data as ProjectFromDB[]) || [];

  // Chuẩn bị dữ liệu cho Export Report (Vẫn giữ logic ngầm để nút Export hoạt động)
 const reportData = staff.map(member => {
  const userProjects = projects.filter(
    (p) => p.manager_email?.trim().toLowerCase() === member.email?.trim().toLowerCase()
  );
  const active = userProjects.filter((p) => p.progress < 100);
  const done = userProjects.filter((p) => p.progress === 100);

  return {
    full_name: member.full_name,
    email: member.email,
    active_projects: active.map(p => p.name).join("; "),
    completed_count: done.length,
    performance: 0 // Thêm dòng này để đánh lừa TypeScript
  };
});

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield size={12} className="mr-1.5" /> Workspace Admin
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             Quản lý Nhân sự
          </h1>
          <p className="text-slate-500 font-medium">
            Hệ thống theo dõi phân phối dự án cho <span className="text-slate-900 font-bold">{staff.length}</span> nhân sự nòng cốt.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ExportReportButton data={reportData} />
        </div>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[350px] font-bold text-slate-500 pl-8 h-14 uppercase text-[11px] tracking-widest">Thành viên</TableHead>
              <TableHead className="font-bold text-slate-500 text-center h-14 uppercase text-[11px] tracking-widest">Dự án đang phụ trách</TableHead>
              <TableHead className="font-bold text-slate-500 text-right pr-8 w-[150px] h-14 uppercase text-[11px] tracking-widest">Hoàn thành</TableHead>
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

                return (
                  <TableRow key={member.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                    {/* INFO COLUMN */}
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200 uppercase transform group-hover:scale-105 transition-transform">
                            {member.full_name?.substring(0, 2) || "NS"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">{member.full_name}</p>
                          <div className="flex items-center text-slate-400 text-xs font-medium">
                            <Mail size={12} className="mr-1.5" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* ACTIVE PROJECTS COLUMN */}
                    <TableCell>
                      <div className="flex flex-wrap gap-2 justify-center max-w-[450px] mx-auto">
                        {active.length > 0 ? (
                          active.map((p) => (
                            <Badge key={p.id} className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-blue-100 shadow-sm px-3 py-1 rounded-lg text-[11px] font-bold transition-all">
                              <Timer size={12} className="mr-1.5 opacity-70" /> {p.name}
                            </Badge>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-[11px] font-bold italic">
                            <CheckCircle size={12} /> Sẵn sàng nhận nhiệm vụ
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* COMPLETED COUNT COLUMN */}
                    <TableCell className="text-right pr-8">
                      <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-sm border border-emerald-100 gap-2">
                        <CheckCircle size={16} strokeWidth={3} className="text-emerald-500" />
                        <span>{done.length}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-32">
                   <div className="flex flex-col items-center gap-4 text-slate-300">
                    <div className="p-6 bg-slate-50 rounded-full">
                      <AlertCircle size={64} strokeWidth={1} />
                    </div>
                    <p className="font-bold text-lg text-slate-400">Chưa có dữ liệu nhân sự</p>
                    <p className="text-sm text-slate-400 max-w-[300px]">Hãy đảm bảo các nhân viên đã được gán role staff trong cơ sở dữ liệu.</p>
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
