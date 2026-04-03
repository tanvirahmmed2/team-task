"use client";
import { useEffect, useState } from "react";
import { Users, ClipboardList, Bell, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalTotalUsers} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Total Managers" value={stats.totalManagers} icon={UserPlus} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Total Staff" value={stats.totalStaff} icon={Users} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="System Tasks" value={stats.totalTasks} icon={ClipboardList} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="text-indigo-500" /> Active Notices ({stats.totalNotices})
          </h2>
          <p className="text-slate-500 text-sm">You can manage global and team notices from the Notices tab.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={28} />
      </div>
    </div>
  );
}
