import { ReactNode } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import CharacterAvatar from "@/components/rickandmorty/CharacterAvatar";
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

function LocationValue({ place }: { place: CharacterLocationRef }) {
  return (
    <>
      {place.name}
      {place.url && (
        <span className="mt-1 block break-all text-xs text-slate-500">{place.url}</span>
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
    { label: "Estado", value: <StatusBadge status={character.status} /> },
    { label: "Especie", value: character.species },
    { label: "Tipo", value: character.type || "Sin tipo" },
    { label: "Género", value: GENDER_LABELS[character.gender] ?? character.gender },
    { label: "Origen", value: <LocationValue place={character.origin} /> },
    { label: "Última ubicación", value: <LocationValue place={character.location} /> },
    { label: "Creado", value: `${dateFormatter.format(new Date(character.created))} UTC` },
    {
      label: "Imagen",
      value: <span className="break-all text-sm text-slate-300">{character.image}</span>,
    },
    {
      label: "URL de la API",
      value: <span className="break-all text-sm text-slate-300">{character.url}</span>,
    },
  ];

  const episodes = character.episode.map((url) => url.split("/").at(-1));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-lime-400"
      >
        <IoArrowBack size={16} /> Volver a los personajes
      </Link>

      <article className="mt-6 grid gap-8 md:grid-cols-[20rem_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
          <CharacterAvatar
            src={character.image}
            alt={character.name}
            sizes="(min-width: 768px) 320px, 100vw"
            loading="eager" // es la imagen principal de la página: no se difiere
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{character.name}</h1>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {field.label}
                </dt>
                <dd className="mt-1.5 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Episodios{" "}
          <span className="text-base font-normal text-slate-400">({episodes.length})</span>
        </h2>
        {episodes.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {episodes.map((episode) => (
              <li
                key={episode}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm text-slate-300"
              >
                Ep. {episode}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-slate-400">Este personaje no aparece en ningún episodio.</p>
        )}
      </section>
    </main>
  );
}
