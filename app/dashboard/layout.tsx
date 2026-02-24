import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login"); // Bảo vệ trang dashboard

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3 bg-white p-2 rounded-full shadow-sm border px-4">
            <span className="font-medium text-slate-700 text-sm">
              Chào, {user.user_metadata.full_name || user.email} 👋
            </span>
            <img 
              src={user.user_metadata.avatar_url || "https://avatar.vercel.sh/guest"} 
              alt="Avatar"
              className="w-8 h-8 rounded-full border-2 border-blue-500"
            />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}