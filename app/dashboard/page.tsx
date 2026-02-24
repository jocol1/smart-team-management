import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateProjectForm } from "@/components/create-project-form";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { UpdateStatusSelect } from "@/components/update-status-select";
import { UpdateProgressSlider } from "@/components/update-progress-slider";
import { LayoutDashboard, CheckCircle2, Clock, Briefcase } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Lấy thông tin user hiện tại
  const { data: { user } } = await supabase.auth.getUser();
const { data: staffProfiles } = await supabase
  .from('profiles')
  .select('id, full_name, email')
  .eq('role', 'staff');
  // 2. Lấy Role và thông tin Profile của người đang đăng nhập
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // 3. Lấy danh sách nhân viên (Chỉ lấy những người là staff để gán việc)
  // Đây là phần sửa lỗi "không thấy staff" của bạn


  // 4. Lấy dữ liệu projects (RLS sẽ tự động lọc: Admin thấy hết, Staff thấy việc của mình)
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // Tính toán số liệu cho Stats Cards
  const totalProjects = projects?.length || 0;
  const inProgressProjects = projects?.filter(p => p.status === 'in-progress').length || 0;
  const doneProjects = projects?.filter(p => p.status === 'done').length || 0;

  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" /> 
            {isAdmin ? "Hệ thống quản trị" : "Bảng công việc của tôi"}
          </h1>
          <p className="text-slate-500 mt-1">Chào {user?.email?.split('@')[0]}, quản lý tiến độ dự án thời gian thực.</p>
        </div>
        
        {/* TRUYỀN DANH SÁCH STAFF VÀO FORM TẠO DỰ ÁN */}
       {isAdmin && <CreateProjectForm profiles={staffProfiles || []} />}
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng dự án</p>
            <p className="text-2xl font-bold text-slate-900">{totalProjects}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Đang thực hiện</p>
            <p className="text-2xl font-bold text-slate-900">{inProgressProjects}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-slate-900">{doneProjects}</p>
          </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Danh sách dự án</h3>
          <Badge variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700">
            {totalProjects} Công việc
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[25%] pl-6">Dự án</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead>Người phụ trách</TableHead>
                <TableHead className="w-[200px]">Tiến độ</TableHead>
                {isAdmin && <TableHead className="w-[100px] text-center">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-slate-900 pl-6">
                      {project.name}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex justify-center">
                        {isAdmin ? (
                          <UpdateStatusSelect id={project.id} currentStatus={project.status} />
                        ) : (
                          <Badge 
                            variant="secondary"
                            className={
                              project.status === 'done' ? 'bg-emerald-100 text-emerald-700 border-none' : 
                              project.status === 'in-progress' ? 'bg-amber-100 text-amber-700 border-none' : 
                              'bg-slate-100 text-slate-600 border-none'
                            }
                          >
                            {project.status === 'done' ? 'Hoàn thành' : 
                             project.status === 'in-progress' ? 'Đang làm' : 'Chờ xử lý'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs uppercase">
                          {project.manager_name?.substring(0, 2)}
                        </div>
                        {project.manager_name}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>{project.progress}%</span>
                        </div>
                        {/* Logic Slider: Staff được kéo việc của họ, Admin chỉ xem */}
                        {!isAdmin && project.manager_email === user?.email ? (
                          <UpdateProgressSlider id={project.id} currentProgress={project.progress} />
                        ) : (
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
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
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Briefcase size={48} strokeWidth={1} />
                      <p className="text-lg">Không có dự án nào được tìm thấy.</p>
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