import { STATUS_LABELS } from "@/lib/rickandmorty";
import type { CharacterStatus } from "@/types/rickandmorty";

// El color sale de data-status (ver rickandmorty.css): vivo, muerto o desconocido
export default function StatusBadge({ status }: { status: CharacterStatus }) {
  return (
    <span
      data-status={status}
      className="inline-flex items-center gap-2 text-sm font-medium"
      style={{ color: "var(--rm-ring)" }}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{
          background: "var(--rm-ring)",
          boxShadow: "0 0 0 3px color-mix(in oklab, var(--rm-ring) 22%, transparent)",
        }}
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
