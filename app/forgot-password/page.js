"use client";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setDone(true);
      toast.success("Instructions sent to your email");
    } catch (error) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">Forgot Password</h2>
          <p className="text-slate-500 mt-2">Enter your email to receive a reset link</p>
        </div>

        {done ? (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center">
            <h3 className="font-bold mb-2">Check your inbox</h3>
            <p className="text-sm">If an account exists for {email}, a recovery link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="admin@teamtask.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
