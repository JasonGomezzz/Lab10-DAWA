"use client"; // Los error boundaries deben ser Client Components

import { useEffect } from "react";
import Link from "next/link";
import { IoReload, IoWarning } from "react-icons/io5";

interface PokemonErrorProps {
  error: unknown;
  retry: () => void;
}

export default function PokemonError({ error, retry }: PokemonErrorProps) {
  useEffect(() => {
    // Aquí se enviaría el error a un servicio de monitoreo
    console.error(error);
  }, [error]);

  // En producción el mensaje de un Server Component llega genérico; el digest permite rastrearlo en los logs
  const digest =
    error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <div className="p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden text-center">
        <div className="bg-linear-to-r from-black to-red-600 p-8">
          <IoWarning size={64} className="inline-block text-yellow-300" />
          <h1 className="text-3xl font-bold text-white mt-2">
            ¡Un Pokémon salvaje cortó la conexión!
          </h1>
        </div>

        <div className="p-8 text-gray-700">
          <p className="text-lg">
            No pudimos cargar la información del Pokédex. Puede ser un problema
            temporal con el servicio de la PokeAPI.
          </p>
          {digest && (
            <p className="mt-3 text-sm text-gray-400">Código de error: {digest}</p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => retry()}
              className="inline-flex items-center justify-center gap-2 bg-black hover:bg-purple-900 text-white font-bold py-3 px-6 rounded-lg transition cursor-pointer"
            >
              <IoReload size={20} /> Intentar de nuevo
            </button>
            <Link
              href="/pokemon"
              className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
            >
              Ir al inicio del Pokédex
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
