"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Phone, MapPin, Building, Briefcase, Heart, Save } from "lucide-react";

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  const [personalInfo, setPersonalInfo] = useState({
    phone: "",
    department: "",
    designation: "",
    address: "",
    emergencyContact: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // we need to get user ID. But wait, `/api/auth/me` doesn't exist, we just rely on token.
      // But we built `GET /api/users/[id]`. To get our own profile, we need our own ID.
      // Easiest is to decode token in API or just create `GET /api/users/profile`.
      // Let's call GET /api/users/profile to fetch the user!
      const res = await fetch("/api/users/profile");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        if (data.user.personalInfo) {
          setPersonalInfo({
            phone: data.user.personalInfo.phone || "",
            department: data.user.personalInfo.department || "",
            designation: data.user.personalInfo.designation || "",
            address: data.user.personalInfo.address || "",
            emergencyContact: data.user.personalInfo.emergencyContact || ""
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalInfo })
      });
      if (!res.ok) throw new Error("Failed to save profile");
      toast.success("Personal Information updated!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account and personal human resources data.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
           <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
             <p className="text-slate-500">{user?.email} • <span className="text-indigo-600 font-semibold">{user?.role}</span></p>
           </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Senior Developer"
                  value={personalInfo.designation}
                  onChange={e => setPersonalInfo({...personalInfo, designation: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Engineering"
                  value={personalInfo.department}
                  onChange={e => setPersonalInfo({...personalInfo, department: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <div className="relative">
                <Heart size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Name / Phone"
                  value={personalInfo.emergencyContact}
                  onChange={e => setPersonalInfo({...personalInfo, emergencyContact: e.target.value})}
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="123 Main St, City, Country"
                  value={personalInfo.address}
                  onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition disabled:opacity-70">
              <Save size={18} /> {saving ? "Saving..." : "Save Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
