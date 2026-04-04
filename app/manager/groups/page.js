"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Users, Edit2, Trash2 } from "lucide-react";

export default function ManagerGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [groupName, setGroupName] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const gRes = await fetch("/api/groups");
      const gData = await gRes.json();
      if (gRes.ok) setGroups(gData.groups);

      const sRes = await fetch("/api/manager/staff");
      const sData = await sRes.json();
      if (sRes.ok) setStaff(sData.staff);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const url = editingId ? `/api/groups/${editingId}` : "/api/groups/create";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { name: groupName } : { name: groupName, members: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Group ${editingId ? "updated" : "created"}!`);
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Group deleted");
        fetchData();
      } else {
        throw new Error("Failed to delete group");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openEditModal = (group) => {
    setGroupName(group.name);
    setEditingId(group._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setGroupName("");
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/groups/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup._id, userId: selectedMemberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Member added!");
      setShowAddMember(false);
      setSelectedMemberId("");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Task Groups</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> Create Group
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Loading groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-500">
              No groups created yet.
            </div>
          ) : (
            groups.map(group => (
              <div key={group._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-indigo-500" />
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(group)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded transition" title="Rename Group">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteGroup(group._id)} className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded transition" title="Delete Group">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Members ({group.members.length})</h4>
                <div className="flex-1 space-y-2 mb-6">
                  {group.members.length === 0 ? (
                    <p className="text-sm text-slate-400">No members.</p>
                  ) : (
                    group.members.map(m => (
                      <div key={m._id} className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex flex-shrink-0 items-center justify-center font-bold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{m.name}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button 
                    onClick={() => { setSelectedGroup(group); setShowAddMember(true); }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition"
                  >
                    + Add Member
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? "Rename Group" : "Create Group"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleCreateOrUpdateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Design Team"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                />
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium disabled:opacity-70">
                  {creating ? "Saving..." : (editingId ? "Save Name" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Add to {selectedGroup?.name}</h3>
              <button onClick={() => setShowAddMember(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Staff Member</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                >
                  <option value="" disabled>Select a member...</option>
                  {staff.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddMember(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">Cancel</button>
                <button type="submit" disabled={creating || !selectedMemberId} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium disabled:opacity-70">
                  {creating ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
