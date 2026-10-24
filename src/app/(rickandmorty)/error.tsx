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
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <IoWarning size={64} className="text-yellow-400" />
      <h1 className="mt-6 text-3xl font-bold">Algo salió mal en el multiverso</h1>
      <p className="mt-3 text-slate-400">
        No pudimos cargar los personajes. Puede ser un problema temporal con la API
        de Rick and Morty.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-lime-400 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-lime-300"
      >
        <IoReload size={18} /> Intentar de nuevo
      </button>
    </main>
  );
}
