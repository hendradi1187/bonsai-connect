import { Outlet } from "react-router-dom";
import { JudgeSidebar } from "@/components/JudgeSidebar";

export function JudgeLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbf9_0%,#eef4f1_100%)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <JudgeSidebar />
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-white/80 px-6 py-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">PPBI Depok</p>
            <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-slate-900">Dedicated Judge Panel</h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
