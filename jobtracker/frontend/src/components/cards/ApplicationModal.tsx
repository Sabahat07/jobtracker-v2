import { useState } from "react";
import {
  X, Sparkles, Loader2, Copy, Check, Trash2, Edit2, Save,
  ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { Application, ApplicationStatus, COLUMNS, ParsedJobDescription, ResumeSuggestion } from "../../types";
import { useCreateApplication, useUpdateApplication, useDeleteApplication, useParseJD } from "../../hooks/useApplications";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Props {
  application?: Application | null; // null = add mode, Application = view mode
  onClose: () => void;
}

const FIELD_CLASS = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors";
const LABEL_CLASS = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

export default function ApplicationModal({ application, onClose }: Props) {
  const isEditMode = !!application;
  const [editing, setEditing] = useState(!isEditMode);
  const [jdText, setJdText] = useState("");
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>(
    application?.resumeSuggestions.map((t, i) => ({ id: `s-${i}`, text: t })) ?? []
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<Partial<Application>>(
    application ?? {
      company: "", role: "", status: "Applied",
      jdLink: "", notes: "", salaryRange: "", seniority: "", location: "",
      requiredSkills: [], niceToHaveSkills: [],
      dateApplied: new Date().toISOString().split("T")[0],
    }
  );

  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const deleteApp = useDeleteApplication();
  const parseJD = useParseJD();

  const set = (key: keyof Application, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const setSkills = (key: "requiredSkills" | "niceToHaveSkills", val: string) =>
    setForm((p) => ({ ...p, [key]: val.split(",").map((s) => s.trim()).filter(Boolean) }));

  const handleParse = async () => {
    if (jdText.trim().length < 50) { toast.error("Paste a full job description (min 50 chars)"); return; }
    const result = await parseJD.mutateAsync(jdText);
    const p: ParsedJobDescription = result.parsed;
    setForm((prev) => ({ ...prev, company: p.company, role: p.role, requiredSkills: p.requiredSkills, niceToHaveSkills: p.niceToHaveSkills, seniority: p.seniority, location: p.location }));
    setSuggestions(result.suggestions);
    toast.success("Parsed! Fields auto-filled ✨");
  };

  const handleCopy = (s: ResumeSuggestion) => {
    navigator.clipboard.writeText(s.text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.role) { toast.error("Company and role are required"); return; }
    const payload = { ...form, resumeSuggestions: suggestions.map((s) => s.text) };
    if (isEditMode) {
      await updateApp.mutateAsync({ id: application._id, ...payload });
      setEditing(false);
    } else {
      await createApp.mutateAsync(payload);
      onClose();
    }
  };

  const handleDelete = async () => {
    await deleteApp.mutateAsync(application!._id);
    onClose();
  };

  const isPending = createApp.isPending || updateApp.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {isEditMode ? (editing ? "Edit Application" : "Application Details") : "Add New Application"}
          </h2>
          <div className="flex items-center gap-2">
            {isEditMode && !editing && (
              <>
                <button onClick={() => setEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors" title="Edit">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Delete confirm */}
        {confirmDelete && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
            <p className="text-sm text-red-400 font-medium">Delete this application permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleteApp.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                {deleteApp.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* AI Parser — only in add mode */}
          {!isEditMode && (
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">AI Job Description Parser</span>
              </div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={4}
                placeholder="Paste the full job description here and click Parse — AI will auto-fill everything below..."
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-xl p-3 resize-none text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              <button onClick={handleParse} disabled={parseJD.isPending}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-violet-500/20">
                {parseJD.isPending ? <><Loader2 size={14} className="animate-spin" /> Parsing...</> : <><Sparkles size={14} /> Parse with AI</>}
              </button>
            </div>
          )}

          {/* Resume Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <button onClick={() => setShowSuggestions(!showSuggestions)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">AI Resume Suggestions ({suggestions.length})</span>
                </div>
                {showSuggestions ? <ChevronUp size={15} className="text-emerald-400" /> : <ChevronDown size={15} className="text-emerald-400" />}
              </button>
              {showSuggestions && (
                <div className="mt-3 space-y-2">
                  {suggestions.map((s) => (
                    <div key={s.id} className="flex items-start gap-2 bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
                      <p className="text-sm text-slate-300 flex-1 leading-relaxed">{s.text}</p>
                      <button onClick={() => handleCopy(s)} className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0 mt-0.5">
                        {copiedId === s.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} id="app-form" className="space-y-4">

            {/* View mode — read only */}
            {isEditMode && !editing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">{application.role}</p>
                  <p className="text-slate-400 mt-0.5">{application.company}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "Status", value: application.status },
                    { label: "Date Applied", value: format(new Date(application.dateApplied), "MMMM d, yyyy") },
                    { label: "Location", value: application.location },
                    { label: "Seniority", value: application.seniority },
                    { label: "Salary", value: application.salaryRange },
                  ].filter((f) => f.value).map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
                      <p className="text-slate-200">{value}</p>
                    </div>
                  ))}
                </div>
                {application.jdLink && (
                  <a href={application.jdLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    <ExternalLink size={13} /> View Job Posting
                  </a>
                )}
                {application.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.requiredSkills.map((s) => (
                        <span key={s} className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {application.niceToHaveSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Nice to Have</p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.niceToHaveSkills.map((s) => (
                        <span key={s} className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {application.notes && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Notes</p>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{application.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Edit / Add form */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Company *</label>
                    <input type="text" required value={form.company ?? ""} onChange={(e) => set("company", e.target.value)} className={FIELD_CLASS} placeholder="Google" />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Role *</label>
                    <input type="text" required value={form.role ?? ""} onChange={(e) => set("role", e.target.value)} className={FIELD_CLASS} placeholder="Software Engineer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={FIELD_CLASS}>
                      {COLUMNS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Date Applied</label>
                    <input type="date" value={form.dateApplied?.toString().split("T")[0] ?? ""} onChange={(e) => set("dateApplied", e.target.value)} className={FIELD_CLASS} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Location</label>
                    <input type="text" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} className={FIELD_CLASS} placeholder="Remote / Bangalore" />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Seniority</label>
                    <input type="text" value={form.seniority ?? ""} onChange={(e) => set("seniority", e.target.value)} className={FIELD_CLASS} placeholder="Junior / Senior" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Salary Range</label>
                    <input type="text" value={form.salaryRange ?? ""} onChange={(e) => set("salaryRange", e.target.value)} className={FIELD_CLASS} placeholder="₹12L - ₹18L" />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Job Link</label>
                    <input type="url" value={form.jdLink ?? ""} onChange={(e) => set("jdLink", e.target.value)} className={FIELD_CLASS} placeholder="https://..." />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Required Skills</label>
                  <input type="text" value={(form.requiredSkills ?? []).join(", ")} onChange={(e) => setSkills("requiredSkills", e.target.value)} className={FIELD_CLASS} placeholder="React, TypeScript, Node.js (comma separated)" />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Nice to Have</label>
                  <input type="text" value={(form.niceToHaveSkills ?? []).join(", ")} onChange={(e) => setSkills("niceToHaveSkills", e.target.value)} className={FIELD_CLASS} placeholder="Docker, AWS (comma separated)" />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Notes</label>
                  <textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={`${FIELD_CLASS} resize-none`} placeholder="Referral from someone, follow up on..." />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        {(editing || !isEditMode) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
            <button onClick={isEditMode ? () => setEditing(false) : onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" form="app-form" disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-violet-500/20">
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {isEditMode ? "Save Changes" : "Save Application"}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
