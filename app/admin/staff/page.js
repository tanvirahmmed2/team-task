"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (res.ok) setStaff(data.staff);
    } catch (error) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">All Staff Members</h1>
        <p className="text-slate-500 mt-2">View all staff members across the organization.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading staff...</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Supervising Manager</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No staff members found. Managers need to create them.</td>
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
                    <td className="p-4 text-slate-600">
                      {member.managerId ? member.managerId.name : "N/A"}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(member.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
