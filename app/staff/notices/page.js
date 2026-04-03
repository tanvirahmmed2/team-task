"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

export default function StaffNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Notice Board</h1>
        <p className="text-slate-500 mt-1">Important announcements from management.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading notices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500">
              No new notices.
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
                  <span>From: {notice.createdBy?.name || "System"}</span>
                  <span>{new Date(notice.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
