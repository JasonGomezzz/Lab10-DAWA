import CharacterExplorer from "@/components/rickandmorty/CharacterExplorer";
import { getCharactersPage, toListData } from "@/lib/rickandmorty";

export default async function HomePage() {
  // Se renderiza en el servidor y la petición queda forzada en caché (cache: "force-cache")
  const initial = toListData(await getCharactersPage(1));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Personajes</h1>
        <p className="mt-3 text-slate-400">
          Explora a los {initial.info.count} personajes del multiverso de Rick and
          Morty. Filtra por nombre, estado, tipo o género y entra a cada ficha para
          ver todos sus datos.
        </p>
      </header>

      <CharacterExplorer initial={initial} />
    </main>
  );
}
