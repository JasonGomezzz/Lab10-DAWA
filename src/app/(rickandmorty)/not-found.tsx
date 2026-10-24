import Link from "next/link";
import { GiAlienStare } from "react-icons/gi";

export default function CharacterNotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <GiAlienStare size={72} className="text-lime-400" />
      <h1 className="mt-6 text-3xl font-bold">Personaje no encontrado</h1>
      <p className="mt-3 text-slate-400">
        Este personaje no existe en esta dimensión. Revisa el enlace o vuelve a la
        lista para explorar a los demás.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-lime-400 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-lime-300"
      >
        ← Volver a los personajes
      </Link>
    </main>
  );
}
