import Link from "next/link";
import { GiAlienStare } from "react-icons/gi";
import PortalArt from "@/components/rickandmorty/PortalArt";

export default function CharacterNotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <div className="relative size-44">
        <PortalArt variant="rim" uid="no-encontrado" className="absolute inset-0 h-full w-full" />
        <GiAlienStare
          size={72}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rm-text-portal"
          aria-hidden="true"
        />
      </div>
      <h1 className="rm-display mt-8 text-4xl sm:text-5xl">Este personaje no existe</h1>
      <p className="mt-4 rm-text-muted">
        No hay ninguna ficha con ese identificador en esta dimensión. Vuelve a la lista y
        elige otro personaje.
      </p>
      <Link href="/" className="rm-btn rm-btn-primary mt-9 px-7 py-3.5">
        Volver a los personajes
      </Link>
    </main>
  );
}
