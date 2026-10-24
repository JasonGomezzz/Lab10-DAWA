import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/components/rickandmorty/StatusBadge";
import type { CharacterSummary } from "@/types/rickandmorty";

export default function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <Link
      href={`/character/${character.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:border-lime-400/60 motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-lime-400"
    >
      <div className="relative aspect-square bg-slate-800">
        <Image
          src={character.image}
          alt={character.name}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          loading="lazy" // carga bajo demanda: solo se descarga al acercarse al viewport
          className="object-cover"
        />
      </div>

      <div className="space-y-2 p-4">
        <h2 className="truncate text-lg font-semibold transition-colors group-hover:text-lime-400">
          {character.name}
        </h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={character.status} />
          <span className="truncate text-sm text-slate-300">{character.species}</span>
        </div>
        <p className="truncate text-sm text-slate-400">{character.location}</p>
      </div>
    </Link>
  );
}
