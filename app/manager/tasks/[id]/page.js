"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Clock, User, ArrowLeft, History } from "lucide-react";
import Link from "next/link";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const [tRes, cRes, lRes] = await Promise.all([
        fetch(`/api/tasks/${id}`),
        fetch(`/api/comments/${id}`),
        fetch(`/api/tasks/logs/${id}`)
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      const lData = await lRes.json();

      if (tRes.ok) setTask(tData.task);
      if (cRes.ok) setComments(cData.comments);
      if (lRes.ok) setLogs(lData.logs);
      
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load task details");
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch("/api/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, message: newComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNewComment("");
      // refetch comments
      const cRes = await fetch(`/api/comments/${id}`);
      const cData = await cRes.json();
      setComments(cData.comments);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <div className="animate-pulse flex p-8 text-slate-500">Loading details...</div>;
  if (!task) return <div className="p-8 text-slate-500">Task not found</div>;

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto pb-12">
      <Link href="/manager/tasks" className="text-sm font-medium text-indigo-600 flex items-center gap-2 mb-6 hover:underline w-max">
        <ArrowLeft size={16} /> Back to tasks
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">{task.title}</h1>
          <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">{task.status}</span>
        </div>
        <p className="text-slate-600 mb-8 max-w-3xl leading-relaxed">{task.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assigned To</span>
            <p className="text-sm font-medium text-slate-800">{task.type === "direct" ? task.assignedTo?.name : `Group: ${task.groupId?.name}`}</p>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Priority</span>
            <p className="text-sm font-medium text-slate-800">{task.priority}</p>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Deadline</span>
            <p className="text-sm font-medium text-slate-800">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "None"}</p>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Type</span>
            <p className="text-sm font-medium text-slate-800 capitalize">{task.type}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Comments Section */}
        <div className="md:col-span-2 flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
            Comments
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-slate-400 text-sm mt-10">No comments yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c._id} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {c.userId?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm">{c.userId?.name}</span>
                      <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="bg-slate-50 text-slate-700 p-3 rounded-lg rounded-tl-none border border-slate-100 text-sm">
                      {c.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handlePostComment} className="flex gap-2 text-sm">
              <input
                type="text"
                placeholder="Type your comment..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button disabled={postingComment} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition disabled:opacity-70">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
            <History size={16} /> Activity Log
          </div>
          <div className="flex-1 overflow-y-auto p-6 relative">
            <div className="absolute left-[33px] top-6 bottom-6 w-px bg-slate-200"></div>
            <div className="space-y-6 relative">
              {logs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">No activity recorded.</p>
              ) : (
                logs.map(log => (
                  <div key={log._id} className="flex gap-4 relative z-10">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{log.actionType}</p>
                      <p className="text-xs text-slate-500 mt-1">{log.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp || log.createdAt).toLocaleString()} by {log.changedBy?.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
