export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            {/* Icon */}
          </div>
        </div>
        {/* We would fetch these stats from the API in a real implementation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">34</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            {/* Icon */}
          </div>
        </div>
      </div>
    </div>
  );
}
