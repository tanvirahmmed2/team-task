"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Setup failed");
        setLoading(false);
        return;
      }

      toast.success("Master Admin created and logged in!");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error("An error occurred during setup.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-white/20 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white rounded-2xl mx-auto flex items-center justify-center text-3xl font-extrabold shadow-lg mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Setup</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Welcome to Team Task. Create the Master Administrator account to initialize the environment.
          </p>
        </div>

        <form onSubmit={handleSetup} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="CEO / Master Admin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Secure Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="admin@yourcompany.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Master Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Initializing..." : "Initialize System"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 font-medium bg-slate-50 p-3 rounded-lg">
          For security, this page will permanently lock itself after the first admin is created.
        </div>
      </div>
    </div>
  );
}
