"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Phone, Building, Briefcase, MapPin, Heart, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function StaffProfileView({ params }) {
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ completedTasks: 0, workingOnTasks: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [params]);

  const fetchProfile = async () => {
    try {
      const p = await params;
      const res = await fetch(`/api/users/${p.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUserProfile(data.user);
      setStats(data.stats);
    } catch (error) {
      toast.error(error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-500">Retrieving Staff Portfolio...</div>;
  if (!userProfile) return null;

  const info = userProfile.personalInfo || {};

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Staff Portfolio</h1>
          <p className="text-slate-500 mt-1">Detailed HR Information & Task Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
            <div className="h-24 w-24 bg-gradient-to-tr from-indigo-500 to-emerald-400 text-white rounded-full mx-auto flex items-center justify-center text-4xl font-bold shadow-lg mb-4">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{userProfile.name}</h2>
            <p className="text-slate-500 font-medium mb-4">{userProfile.email}</p>
            <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold tracking-wide uppercase">
              {userProfile.role}
            </div>
            {userProfile.status === "Blocked" && (
              <div className="mt-2 inline-flex items-center justify-center bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold tracking-wide uppercase">
                BLOCKED ACCOUNT
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Task Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-semibold text-emerald-900">Completed</span>
                </div>
                <span className="text-2xl font-black text-emerald-700">{stats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="font-semibold text-amber-900">Working On</span>
                </div>
                <span className="text-2xl font-black text-amber-700">{stats.workingOnTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 h-full">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Personal Information Store</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <InfoBlock icon={Briefcase} label="Designation" value={info.designation} />
              <InfoBlock icon={Building} label="Department" value={info.department} />
              <InfoBlock icon={Phone} label="Phone Number" value={info.phone} />
              <InfoBlock icon={Heart} label="Emergency Contact" value={info.emergencyContact} />
              <div className="md:col-span-2">
                <InfoBlock icon={MapPin} label="Home Address" value={info.address} />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-sm font-medium text-slate-400">
              Onboarded Date: {new Date(userProfile.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-500">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-medium text-slate-800 text-lg">
          {value ? value : <span className="text-slate-300 italic">Not Provided</span>}
        </p>
      </div>
    </div>
  );
}
