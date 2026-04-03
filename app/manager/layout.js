import Sidebar from "@/components/Sidebar";

export default function ManagerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="Manager" />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
