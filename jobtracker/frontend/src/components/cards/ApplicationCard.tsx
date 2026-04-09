import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Application, COLUMN_COLORS } from "../../types";
import { MapPin, Calendar, GripVertical, Building2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  application: Application;
  onClick: () => void;
}

export default function ApplicationCard({ application, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application._id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  const colors = COLUMN_COLORS[application.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`bg-slate-800/80 border ${colors.card} border rounded-xl p-4 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all group select-none`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Building2 size={12} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400 truncate font-medium">{application.company}</span>
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{application.role}</h3>
        </div>
        <div
          {...attributes} {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={15} />
        </div>
      </div>

      {application.requiredSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {application.requiredSkills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-md">
              {skill}
            </span>
          ))}
          {application.requiredSkills.length > 3 && (
            <span className="text-xs text-slate-500">+{application.requiredSkills.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar size={11} />
          {format(new Date(application.dateApplied), "MMM d")}
        </div>
        {application.location && (
          <div className="flex items-center gap-1 truncate ml-2">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{application.location}</span>
          </div>
        )}
        {application.salaryRange && (
          <span className={`${colors.text} font-medium`}>{application.salaryRange}</span>
        )}
      </div>
    </div>
  );
}
