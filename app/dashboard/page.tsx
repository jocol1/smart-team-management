import { createClient } from "@/utils/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateProjectForm } from "@/components/create-project-form";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { UpdateStatusSelect } from "@/components/update-status-select";
import { UpdateProgressSlider } from "@/components/update-progress-slider";
import { LayoutDashboard, CheckCircle2, Clock, Briefcase, AlertCircle } from "lucide-react";

/* ================= TYPES ================= */

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number; // Lấy trực tiếp từ Int4 trong DB
  manager_name: string | null; // Cột text trong schema của bạn
  manager_email: string | null;
  deadline: string | null;
};

/* ================= PAGE ================= */

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Kiểm tra Role người dùng
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // 2. Lấy danh sách nhân viên (dành cho Admin tạo dự án)
  const { data: staffProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "staff");

  // 3. Truy vấn Projects dựa trên Schema thực tế (Không dùng Join profiles)
  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, status, progress, manager_name, manager_email, deadline")
    .order("created_at", { ascending: false });

  const projects = (projectsData as Project[]) ?? [];

  // Thống kê số liệu
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === "in-progress" || p.progress < 100).length;
  const doneProjects = projects.filter(p => p.status === "done" || p.progress === 100).length;

  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" />
            {isAdmin ? "Hệ thống quản trị SmartHub" : "Bảng công việc của tôi"}
          </h1>
          <p className="text-slate-500 mt-1">
            Chào <span className="font-bold text-slate-700">{user.email?.split("@")[0]}</span>, hệ thống đang ghi nhận {totalProjects} dự án.
          </p>
        </div>

        {isAdmin && <CreateProjectForm profiles={staffProfiles || []} />}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Briefcase size={24} />} label="Tổng dự án" value={totalProjects} color="blue" />
        <StatCard icon={<Clock size={24} />} label="Đang thực hiện" value={inProgressProjects} color="amber" />
        <StatCard icon={<CheckCircle2 size={24} />} label="Đã hoàn thành" value={doneProjects} color="emerald" />
      </div>

      {/* PROJECTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-white flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Chi tiết tiến độ công việc</h3>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 font-bold">
            {totalProjects} Items
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-8 font-bold text-slate-700">TÊN DỰ ÁN</TableHead>
                <TableHead className="text-center font-bold text-slate-700">TRẠNG THÁI</TableHead>
                <TableHead className="font-bold text-slate-700">NGƯỜI PHỤ TRÁCH</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-8">TIẾN ĐỘ (%)</TableHead>
                {isAdmin && <TableHead className="text-center font-bold text-slate-700 w-[100px]">THAO TÁC</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 font-bold text-slate-800">
                      {project.name}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {isAdmin ? (
                          <UpdateStatusSelect id={project.id} currentStatus={project.status} />
                        ) : (
                          <Badge variant="outline" className="capitalize bg-slate-50 font-medium">
                            {project.status === "in-progress" ? "Đang làm" : "Hoàn thành"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black border border-indigo-200 uppercase">
                          {project.manager_name?.substring(0, 2) || "??"}
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          {project.manager_name || "Chưa gán"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="pr-8">
                      <div className="flex flex-col items-end gap-2 min-w-[160px]">
                        <span className="text-xs font-black text-blue-600">
                          {project.progress}%
                        </span>

                        {/* Nếu là nhân viên sở hữu dự án thì hiện Slider, còn lại hiện thanh tĩnh */}
                        {!isAdmin && project.manager_email === user.email ? (
                          <div className="w-full">
                            <UpdateProgressSlider id={project.id} currentProgress={project.progress} />
                          </div>
                        ) : (
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all duration-1000 ${project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {isAdmin && (
                      <TableCell className="text-center">
                        <DeleteProjectButton id={project.id} />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-20 text-slate-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={32} strokeWidth={1.5} />
                      <p>Hệ thống chưa ghi nhận dự án nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: "blue" | "amber" | "emerald" }) {
  const styles = {
    blue: "border-l-blue-500 text-blue-600 bg-blue-50",
    amber: "border-l-amber-500 text-amber-600 bg-amber-50",
    emerald: "border-l-emerald-500 text-emerald-600 bg-emerald-50",
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border border-l-4 shadow-sm flex items-center gap-4 ${styles[color].split(' ')[0]}`}>
      <div className={`p-3 rounded-xl ${styles[color].split(' ').slice(1).join(' ')}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}