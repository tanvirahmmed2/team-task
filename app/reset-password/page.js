"use client";
import { useState, Suspense } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-6 text-rose-600 bg-rose-50 rounded-xl">
        <p className="font-bold">Invalid or missing token</p>
        <p className="text-sm mt-2">Please request a new password reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-indigo-600 font-medium">Request New Link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-2">Password Reset Successful!</h3>
          <p className="text-sm">You can now sign in with your new password.</p>
        </div>
        <Link href="/" className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all">
          Go to Login <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock size={18} />
          </div>
          <input
            type="password"
            required
            minLength={6}
            className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock size={18} />
          </div>
          <input
            type="password"
            required
            minLength={6}
            className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">Set New Password</h2>
          <p className="text-slate-500 mt-2">Create a new secure password</p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 py-8">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
