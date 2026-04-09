import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Application, ApplicationStatus, COLUMN_COLORS } from "../../types";
import ApplicationCard from "../cards/ApplicationCard";

interface Props {
  status: ApplicationStatus;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({ status, applications, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = COLUMN_COLORS[status];

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <h2 className={`font-semibold text-sm ${colors.text}`}>{status}</h2>
        <span className="ml-auto bg-slate-800 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-700">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-32 rounded-xl p-2 transition-all ${
          isOver
            ? `${colors.bg} ring-1 ring-${colors.dot}/50`
            : "bg-slate-900/50"
        }`}
      >
        <SortableContext items={applications.map((a) => a._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {applications.map((app) => (
              <ApplicationCard key={app._id} application={app} onClick={() => onCardClick(app)} />
            ))}
          </div>
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-slate-600 text-xs">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
