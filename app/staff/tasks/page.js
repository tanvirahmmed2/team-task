"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (res.ok) setTasks(data.tasks);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch("/api/tasks/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Task marked as ${newStatus}`);
        fetchTasks();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusColors = {
    "Pending": "bg-slate-100 text-slate-700",
    "Accepted": "bg-blue-100 text-blue-700",
    "In Progress": "bg-amber-100 text-amber-700",
    "Submitted": "bg-purple-100 text-purple-700",
    "Completed": "bg-emerald-100 text-emerald-700"
  };

  return (
    <div className="animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Tasks</h1>
        <p className="text-slate-500 mt-1">Manage and track your assigned work.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading tasks...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500">
              No tasks assigned to you right now. Grab a coffee! ☕
            </div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{task.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[task.status]}`}>
                      {task.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-md font-semibold bg-slate-100 text-slate-600 uppercase">
                      {task.type}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <AlertCircle size={14} className={task.priority === "High" ? "text-rose-500" : ""} /> Priority: {task.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                    </span>
                  </div>
                </div>
                
                <div className="shrink-0 flex gap-2">
                  {task.status === "Pending" && (
                    <button onClick={() => handleUpdateStatus(task._id, "Accepted")} className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg text-sm transition">
                      Accept
                    </button>
                  )}
                  {task.status === "Accepted" && (
                    <button onClick={() => handleUpdateStatus(task._id, "In Progress")} className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded-lg text-sm transition">
                      Start Work
                    </button>
                  )}
                  {task.status === "In Progress" && (
                    <button onClick={async () => {
                      await fetch("/api/tasks/submit", { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({taskId: task._id}) });
                      fetchTasks();
                      toast.success("Task Submitted!");
                    }} className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded-lg text-sm transition">
                      Submit Work
                    </button>
                  )}
                  
                  <Link href={`/staff/tasks/${task._id}`} className="px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold rounded-lg text-sm transition">
                    Open Thread
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
