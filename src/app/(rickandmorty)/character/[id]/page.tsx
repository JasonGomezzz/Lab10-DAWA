import { ReactNode } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import CharacterAvatar from "@/components/rickandmorty/CharacterAvatar";
import PortalArt from "@/components/rickandmorty/PortalArt";
import StatusBadge from "@/components/rickandmorty/StatusBadge";
import {
  GENDER_LABELS,
  getCharacter,
  getTotalCharacters,
} from "@/lib/rickandmorty";
import type { CharacterLocationRef } from "@/types/rickandmorty";

interface CharacterPageProps {
  params: Promise<{
    id: string;
  }>;
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

const isValidId = (id: string) => /^\d+$/.test(id);

export async function generateStaticParams() {
  // SSG: se genera una ruta estática por cada personaje de la API (ids 1..total)
  const total = await getTotalCharacters();

  return Array.from({ length: total }, (_, index) => ({ id: String(index + 1) }));
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { id } = await params;
  const character = isValidId(id) ? await getCharacter(id) : null;

  if (!character) return { title: "Personaje no encontrado" };

  return {
    title: character.name,
    description: `Ficha de ${character.name} (${character.species}) en Rick and Morty`,
    openGraph: { images: [character.image] },
  };
}

function Place({ place }: { place: CharacterLocationRef }) {
  return (
    <>
      {place.name}
      {place.url && (
        <span className="mt-1 block break-all text-xs rm-text-faint">{place.url}</span>
      )}
    </>
  );
}

export default async function CharacterDetail({ params }: CharacterPageProps) {
  const { id } = await params;
  const character = isValidId(id) ? await getCharacter(id) : null;

  if (!character) notFound();

  // Cada campo de la respuesta de la API tiene su lugar en la ficha
  const fields: { label: string; value: ReactNode }[] = [
    { label: "ID", value: `#${character.id}` },
    { label: "Especie", value: character.species },
    { label: "Tipo", value: character.type || "Sin tipo" },
    { label: "Género", value: GENDER_LABELS[character.gender] ?? character.gender },
    { label: "Origen", value: <Place place={character.origin} /> },
    { label: "Última ubicación", value: <Place place={character.location} /> },
    { label: "Creado", value: `${dateFormatter.format(new Date(character.created))} UTC` },
    {
      label: "Imagen",
      value: <span className="break-all text-sm rm-text-muted">{character.image}</span>,
    },
    {
      label: "URL de la API",
      value: <span className="break-all text-sm rm-text-muted">{character.url}</span>,
    },
  ];

  const episodes = character.episode.map((url) => url.split("/").at(-1));

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
      <Link href="/" className="rm-btn">
        <IoArrowBack size={18} /> Volver a los personajes
      </Link>

      <article className="mt-10 grid items-center gap-14 lg:grid-cols-[minmax(0,25rem)_1fr]">
        <div data-status={character.status} className="relative mx-auto w-full max-w-sm">
          <PortalArt
            variant="rim"
            className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="rm-frame rm-arch relative shadow-2xl shadow-black/60">
            <div className="rm-frame-inner rm-arch">
              <CharacterAvatar
                src={character.image}
                alt={character.name}
                sizes="(min-width: 1024px) 400px, 80vw"
                loading="eager" // es la imagen principal de la página: no se difiere
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <StatusBadge status={character.status} />
          <h1 className="rm-display mt-3 text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[0.95]">
            {character.name}
          </h1>

          <dl className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="min-w-0 border-t py-4"
                style={{ borderColor: "var(--rm-line)" }}
              >
                <dt className="text-sm rm-text-faint">{field.label}</dt>
                <dd className="mt-1 break-words text-lg">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>

      <section className="mt-20">
        <h2 className="rm-display text-3xl sm:text-4xl">
          Episodios <span className="rm-text-faint">({episodes.length})</span>
        </h2>
        {episodes.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {episodes.map((episode) => (
              <li
                key={episode}
                className="rounded-full border px-3.5 py-1.5 text-sm tabular-nums rm-text-muted"
                style={{ borderColor: "var(--rm-line)", background: "rgb(255 255 255 / 0.03)" }}
              >
                Ep. {episode}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rm-text-muted">Este personaje no aparece en ningún episodio.</p>
        )}
      </section>
    </main>
  );
}
