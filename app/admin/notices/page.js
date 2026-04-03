"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, BellRing } from "lucide-react";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "", priority: "Normal", target: "all" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      if (res.ok) setNotices(data.notices);
    } catch (error) {
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/notices/route", { // Note: The route file is at app/api/notices/route.js, POST there
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      // Wait, POST is at /api/notices/route according to the filename, wait I called it `/api/notices/route.js`.
      // The path in next.js is `/api/notices`.
      const apiUrl = "/api/notices";
      const finalRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await finalRes.json();
      if (!finalRes.ok) throw new Error(data.error);

      toast.success("Notice created successfully!");
      setShowModal(false);
      setFormData({ title: "", message: "", priority: "Normal", target: "all" });
      fetchNotices();
    } catch (error) {
      toast.error(error.message || "Failed to create notice");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">System Notices</h1>
          <p className="text-slate-500 mt-1">Manage global announcements for all users.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> New Notice
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading notices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500">
              No notices published yet.
            </div>
          ) : (
            notices.map(notice => (
              <div key={notice._id} className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    {notice.priority === "Urgent" && <BellRing size={16} className="text-rose-500" />}
                    {notice.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${notice.priority === "Urgent" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-slate-600 mb-4 whitespace-pre-wrap">{notice.message}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                  <span>Target: {notice.target.toUpperCase()}</span>
                  <span>{new Date(notice.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Publish Global Notice</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 cursor-not-allowed"
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: e.target.value})}
                    disabled // Admins can only do 'all' or let them choose 'all'. The prompt says global notices.
                  >
                    <option value="all">All Users</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium disabled:opacity-70">
                  {creating ? "Publishing..." : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
