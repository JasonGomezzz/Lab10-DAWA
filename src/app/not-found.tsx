import Link from "next/link";
import { TbPokeball } from "react-icons/tb";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-linear-to-br from-black to-purple-900 p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center">
        <div className="bg-linear-to-r from-black to-purple-700 p-8">
          <TbPokeball size={72} className="inline-block text-white" />
          <h1 className="text-6xl font-bold text-white mt-2">404</h1>
        </div>

        <div className="p-8 text-gray-700">
          <h2 className="text-2xl font-bold">¡Pokémon no encontrado!</h2>
          <p className="mt-3 text-lg">
            La página que buscas no existe o el Pokémon se escapó de la
            Pokébola.
          </p>

          <Link
            href="/pokemon"
            className="inline-block mt-8 bg-black hover:bg-purple-900 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            ← Volver al Pokédex
          </Link>
        </div>
      </div>
    </div>
  );
}
