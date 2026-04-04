"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, CheckCircle, Clock, AlertCircle, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ManagerTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "", description: "", type: "direct", assignedTo: "", groupId: "", priority: "Medium", deadline: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, sRes, gRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/manager/staff"),
        fetch("/api/groups")
      ]);
      const tData = await tRes.json();
      const sData = await sRes.json();
      const gData = await gRes.json();

      if (tRes.ok) setTasks(tData.tasks);
      if (sRes.ok) setStaff(sData.staff);
      if (gRes.ok) setGroups(gData.groups);
    } catch (error) {
      toast.error("Failed to load tasks data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...formData };
      if (payload.type === "direct" && !payload.assignedTo) throw new Error("Staff assignment is required");
      if (payload.type === "group" && !payload.groupId) throw new Error("Group assignment is required");

      const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks/create";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Task ${editingId ? "updated" : "created"}!`);
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        fetchData();
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openEditModal = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      assignedTo: task.assignedTo?._id || "",
      groupId: task.groupId?._id || "",
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split("T")[0] : ""
    });
    setEditingId(task._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: "", description: "", type: "direct", assignedTo: "", groupId: "", priority: "Medium", deadline: "" });
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage Direct and Group tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> Create Task
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading tasks...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500">
              No tasks created yet.
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
                    <span>
                      Assigned To: {task.type === "direct" ? task.assignedTo?.name : task.groupId?.name}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex gap-2">
                  {task.status === "Submitted" && (
                    <button 
                      onClick={async () => {
                        await fetch("/api/tasks/status", { method: "PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({taskId: task._id, status: "Completed"}) });
                        fetchData();
                        toast.success("Task Marked as Completed!");
                      }}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold rounded-lg text-sm transition flex items-center gap-1"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  <Link href={`/manager/tasks/${task._id}`} className="px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold rounded-lg text-sm transition">
                    View
                  </Link>
                  <button onClick={() => openEditModal(task)} className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-sm transition" title="Edit Task">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg text-sm transition" title="Delete Task">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? "Edit Task" : "Create Task"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Task Type</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value, assignedTo: "", groupId: ""})}
                  >
                    <option value="direct">Direct (Individual)</option>
                    <option value="group">Group Task</option>
                  </select>
                </div>
                {formData.type === "direct" ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign User</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.assignedTo}
                      onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Staff...</option>
                      {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Group</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.groupId}
                      onChange={e => setFormData({...formData, groupId: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Group...</option>
                      {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium disabled:opacity-70">
                  {creating ? "Saving..." : (editingId ? "Update Task" : "Create Task")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
