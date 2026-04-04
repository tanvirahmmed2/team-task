"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, User, Mail, ShieldAlert, Ban, Trash2, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";

export default function ManagersPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch("/api/admin/managers");
      const data = await res.json();
      if (res.ok) setManagers(data.managers);
    } catch (error) {
      toast.error("Failed to load managers");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Blocked" : "Active";
    if (!confirm(`Are you sure you want to ${currentStatus === "Active" ? "block" : "unblock"} this manager?`)) return;
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Manager ${newStatus.toLowerCase()}`);
        fetchManagers();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to permanently remove this manager?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Manager removed");
        fetchManagers();
      } else {
        throw new Error("Failed to remove manager");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/create-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Manager created successfully!");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "" });
      fetchManagers();
    } catch (error) {
      toast.error(error.message || "Failed to create manager");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Managers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> New Manager
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading managers...</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No managers found. Create one to get started.</td>
                </tr>
              ) : (
                managers.map(manager => (
                  <tr key={manager._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {manager.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{manager.name}</span>
                    </td>
                    <td className="p-4 text-slate-600">{manager.email}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium ml-1">Manager</span>
                      {manager.status === "Blocked" && <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full font-medium ml-2">Blocked</span>}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(manager.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 flex gap-2 justify-end">
                      <Link 
                        href={`/admin/managers/${manager._id}`}
                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                        title="View Profile"
                      >
                        <Eye size={16} />
                      </Link>
                      <button 
                        onClick={() => handleUpdateStatus(manager._id, manager.status || "Active")}
                        className={`p-2 rounded-lg transition ${manager.status === "Blocked" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                        title={manager.status === "Blocked" ? "Unblock" : "Block"}
                      >
                        {manager.status === "Blocked" ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>
                      <button 
                        onClick={() => handleRemove(manager._id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="Remove Permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
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
              <h3 className="text-xl font-bold text-slate-800">Create New Manager</h3>
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
                    placeholder="Jane Doe"
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
                    placeholder="jane@teamtask.com"
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
                  {creating ? "Creating..." : "Create Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
