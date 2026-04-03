export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">My Team</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">8 Members</h3>
        </div>
      </div>
    </div>
  );
}
