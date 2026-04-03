"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Users, UserCheck, Briefcase, Bell, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
  };

  const navLinks = {
    Admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Managers", href: "/admin/managers", icon: UserCheck },
      { name: "Staff", href: "/admin/staff", icon: Users },
      { name: "Notices", href: "/admin/notices", icon: Bell },
    ],
    Manager: [
      { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
      { name: "Tasks", href: "/manager/tasks", icon: ClipboardList },
      { name: "Groups", href: "/manager/groups", icon: Briefcase },
      { name: "Staff", href: "/manager/staff", icon: Users },
      { name: "Notices", href: "/manager/notices", icon: Bell },
    ],
    Staff: [
      { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
      { name: "My Tasks", href: "/staff/tasks", icon: ClipboardList },
      { name: "Notices", href: "/staff/notices", icon: Bell },
    ],
  };

  const links = navLinks[role] || [];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen flex flex-col transition-all">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
            TT
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Team Task</h1>
            <p className="text-xs text-indigo-400 font-medium">{role} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
