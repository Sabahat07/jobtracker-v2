import { useState } from "react";
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Briefcase, Plus, LogOut, User, Loader2 } from "lucide-react";
import { Application, ApplicationStatus, COLUMNS } from "../types";
import { useApplications, useUpdateApplication } from "../hooks/useApplications";
import { useAuthStore } from "../store/authStore";
import KanbanColumn from "../components/board/KanbanColumn";
import ApplicationCard from "../components/cards/ApplicationCard";
import ApplicationModal from "../components/cards/ApplicationModal";

export default function BoardPage() {
  const { data: applications = [], isLoading, isError } = useApplications();
  const updateApp = useUpdateApplication();
  const { user, logout } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [localApps, setLocalApps] = useState<Application[] | null>(null);

  const display = localApps ?? applications;
  const byStatus = (s: ApplicationStatus) => display.filter((a) => a.status === s);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (e: DragStartEvent) => {
    const app = display.find((a) => a._id === e.active.id);
    setActiveApp(app ?? null);
    setLocalApps([...display]);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over || !localApps) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeApp = localApps.find((a) => a._id === activeId);
    if (!activeApp) return;

    if (COLUMNS.includes(overId as ApplicationStatus)) {
      const newStatus = overId as ApplicationStatus;
      if (activeApp.status !== newStatus)
        setLocalApps(localApps.map((a) => a._id === activeId ? { ...a, status: newStatus } : a));
      return;
    }

    const overApp = localApps.find((a) => a._id === overId);
    if (!overApp) return;
    if (activeApp.status !== overApp.status) {
      setLocalApps(localApps.map((a) => a._id === activeId ? { ...a, status: overApp.status } : a));
    } else {
      const col = localApps.filter((a) => a.status === activeApp.status);
      const others = localApps.filter((a) => a.status !== activeApp.status);
      const reordered = arrayMove(col, col.findIndex((a) => a._id === activeId), col.findIndex((a) => a._id === overId));
      setLocalApps([...others, ...reordered]);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!localApps) return;
    const moved = localApps.find((a) => a._id === e.active.id);
    const original = applications.find((a) => a._id === e.active.id);
    if (moved && original && moved.status !== original.status)
      updateApp.mutate({ id: moved._id, status: moved.status });
    setActiveApp(null);
    setLocalApps(null);
  };

  const openAdd = () => { setSelectedApp(null); setModalOpen(true); };
  const openView = (app: Application) => { setSelectedApp(app); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedApp(null); };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navbar */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">JobTracker AI</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20">
            <Plus size={16} /> Add Application
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
              <User size={14} className="text-slate-400" />
            </div>
            <span className="text-sm text-slate-300 font-medium hidden sm:block">{user?.name}</span>
            <button onClick={logout} title="Logout"
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      {applications.length > 0 && (
        <div className="px-6 py-3 border-b border-slate-800/50 flex items-center gap-6 text-xs text-slate-500">
          <span className="text-slate-400 font-medium">{applications.length} total</span>
          {COLUMNS.map((col) => {
            const count = applications.filter((a) => a.status === col).length;
            if (!count) return null;
            return <span key={col}>{col}: <span className="text-slate-300 font-semibold">{count}</span></span>;
          })}
        </div>
      )}

      {/* Board */}
      <main className="flex-1 overflow-x-auto p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-violet-500" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400 text-sm">Failed to load. Check your connection.</p>
          </div>
        )}

        {!isLoading && !isError && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-violet-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">No applications yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Paste a job description and let AI auto-fill everything for you
            </p>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20">
              <Plus size={16} /> Add Your First Application
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 min-w-max pb-4">
              {COLUMNS.map((status) => (
                <KanbanColumn key={status} status={status} applications={byStatus(status)} onCardClick={openView} />
              ))}
            </div>
            <DragOverlay>
              {activeApp && (
                <div className="rotate-2 scale-105 shadow-2xl">
                  <ApplicationCard application={activeApp} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {modalOpen && <ApplicationModal application={selectedApp} onClose={closeModal} />}
    </div>
  );
}
