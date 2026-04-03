"use client";
import { LogOut, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfileView({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    window.location.reload();
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center animate-in zoom-in-95 duration-300">
      <div className="h-20 w-20 bg-indigo-100 text-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-inner mb-4">
        {user.name?.charAt(0).toUpperCase()}
      </div>
      
      <h2 className="text-2xl font-extrabold text-slate-800">{user.name}</h2>
      <p className="text-slate-500 mb-6">{user.email}</p>

      <div className="inline-block bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide mb-8">
        Role: <span className="text-indigo-600">{user.role}</span>
      </div>

      <div className="space-y-3">
        <Link 
          href={`/${user.role.toLowerCase()}/dashboard`}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Enter Dashboard <ArrowRight size={18} />
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-3 rounded-xl transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
