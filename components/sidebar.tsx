// components/sidebar.tsx
import { createClient } from "@/utils/supabase/server";

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Lấy role của user hiện tại
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen p-4">
      <div className="text-xl font-bold mb-8">SmartHub</div>
    
<nav className="space-y-2">
  <a href="/dashboard" className="block p-2 hover:bg-slate-800 rounded">Tổng quan</a>
  <a href="/dashboard/meetings" className="block p-2 hover:bg-slate-800 rounded flex items-center gap-2">
    Lịch họp <span className="bg-red-500 text-[10px] px-1.5 rounded-full">New</span>
  </a>
  
  {isAdmin && (
    <a href="/dashboard/users" className="block p-2 hover:bg-slate-800 rounded text-amber-400">Nhân sự</a>
  )}
</nav>
    </aside>
  );
}