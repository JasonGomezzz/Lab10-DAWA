import { STATUS_LABELS } from "@/lib/rickandmorty";
import type { CharacterStatus } from "@/types/rickandmorty";

const DOT_COLORS: Record<CharacterStatus, string> = {
  Alive: "bg-lime-400",
  Dead: "bg-red-500",
  unknown: "bg-slate-400",
};

export default function StatusBadge({ status }: { status: CharacterStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-200">
      <span
        className={`size-2 rounded-full ${DOT_COLORS[status] ?? "bg-slate-400"}`}
        aria-hidden="true"
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
