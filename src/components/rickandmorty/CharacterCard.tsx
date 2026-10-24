import Link from "next/link";
import { IoLocationSharp } from "react-icons/io5";
import CharacterAvatar from "@/components/rickandmorty/CharacterAvatar";
import StatusBadge from "@/components/rickandmorty/StatusBadge";
import type { CharacterSummary } from "@/types/rickandmorty";

interface CharacterCardProps {
  character: CharacterSummary;
  // Resultados de búsqueda: la foto se pide solo si la tarjeta se queda en pantalla
  gated?: boolean;
  delay?: number;
}

export default function CharacterCard({ character, gated = false, delay = 0 }: CharacterCardProps) {
  return (
    <Link
      href={`/character/${character.id}`}
      data-status={character.status}
      className="rm-card group block"
    >
      <div className="rm-frame rm-arch">
        <div className="rm-frame-inner rm-arch">
          {/* loading="lazy": la imagen solo se descarga al acercarse al viewport */}
          <CharacterAvatar
            src={character.image}
            alt={character.name}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            loading="lazy"
            gated={gated}
            delay={delay}
          />
        </div>
      </div>

      <div className="mt-3 px-1">
        <h2 className="rm-display truncate text-xl leading-tight">{character.name}</h2>
        <div className="mt-1 flex items-center gap-3">
          <StatusBadge status={character.status} />
          <span className="truncate text-sm rm-text-muted">{character.species}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-sm rm-text-faint">
          <IoLocationSharp size={13} className="shrink-0" />
          <span className="truncate">{character.location}</span>
        </p>
      </div>
    </Link>
  );
}
