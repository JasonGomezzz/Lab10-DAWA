"use client"; // Los error boundaries deben ser Client Components

import { useEffect } from "react";
import { IoReload, IoWarning } from "react-icons/io5";

interface RickAndMortyErrorProps {
  error: unknown;
  retry: () => void;
}

export default function RickAndMortyError({ error, retry }: RickAndMortyErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <IoWarning size={64} style={{ color: "var(--rm-yellow)" }} aria-hidden="true" />
      <h1 className="rm-display mt-6 text-4xl sm:text-5xl">No pudimos cargar los personajes</h1>
      <p className="mt-4 rm-text-muted">
        La API de Rick and Morty no respondió. Suele resolverse en unos segundos: vuelve a
        intentarlo.
      </p>
      <button type="button" onClick={() => retry()} className="rm-btn rm-btn-primary mt-9 px-7 py-3.5">
        <IoReload size={18} /> Intentar de nuevo
      </button>
    </main>
  );
}
