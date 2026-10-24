import type { CSSProperties } from "react";
import CharacterAvatar from "@/components/rickandmorty/CharacterAvatar";
import PortalArt from "@/components/rickandmorty/PortalArt";

// Quiénes salen del portal y desde dónde: --fx y --fy son el desplazamiento inicial hacia el centro
const EMERGING = [
  { id: 1, name: "Rick Sanchez", left: "2%", top: "53%", width: "32%", fx: "90%", fy: "-60%" },
  { id: 2, name: "Morty Smith", left: "64%", top: "48%", width: "30%", fx: "-90%", fy: "-45%" },
  { id: 3, name: "Summer Smith", left: "36%", top: "4%", width: "27%", fx: "0%", fy: "100%" },
] as const;

export default function Hero({ total }: { total: number }) {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-16">
      <div>
        <h1 className="rm-display text-[clamp(3rem,7.2vw,6rem)] leading-[0.92]">
          Todos los Ricks,
          <br />
          todos los Mortys.
        </h1>
        <p className="mt-6 max-w-[34rem] text-lg leading-relaxed rm-text-muted">
          Busca entre los {total} personajes de la serie por nombre, estado, tipo o género y
          abre la ficha completa de cada uno.
        </p>
        <a href="#explorador" className="rm-btn rm-btn-primary mt-9 px-7 py-3.5 text-base">
          Explorar personajes
        </a>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
        <div
          aria-hidden="true"
          className="absolute inset-[6%] rounded-full"
          style={{ background: "radial-gradient(circle, rgb(140 240 74 / 0.35), transparent 68%)" }}
        />
        <PortalArt className="absolute inset-0 h-full w-full" />

        {EMERGING.map((character, index) => (
          <div
            key={character.id}
            data-status="Alive"
            className="rm-hero-avatar"
            style={
              {
                left: character.left,
                top: character.top,
                width: character.width,
                "--i": index,
                "--fx": character.fx,
                "--fy": character.fy,
              } as CSSProperties
            }
          >
            <div className="rm-frame rm-arch shadow-2xl shadow-black/50">
              <div className="rm-frame-inner rm-arch">
                <CharacterAvatar
                  src={`https://rickandmortyapi.com/api/character/avatar/${character.id}.jpeg`}
                  alt={character.name}
                  sizes="(min-width: 1024px) 170px, 30vw"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
