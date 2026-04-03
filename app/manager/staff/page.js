"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, User, Mail, ShieldAlert } from "lucide-react";

export default function ManagerStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/manager/staff");
      const data = await res.json();
      if (res.ok) setStaff(data.staff);
    } catch (error) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/manager/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Staff created successfully!");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "" });
      fetchStaff();
    } catch (error) {
      toast.error(error.message || "Failed to create staff");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Team</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> Add Staff Member
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading team...</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">You haven't added any staff members yet.</td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{member.name}</span>
                    </td>
                    <td className="p-4 text-slate-600">{member.email}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-medium">Staff</span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(member.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Add Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="john@teamtask.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                <div className="relative">
                  <ShieldAlert size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Secret Password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium disabled:opacity-70">
                  {creating ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
