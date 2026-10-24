import CharacterExplorer from "@/components/rickandmorty/CharacterExplorer";
import Hero from "@/components/rickandmorty/Hero";
import { getCharactersPage, toListData } from "@/lib/rickandmorty";

export default async function HomePage() {
  // Se renderiza en el servidor y la petición queda forzada en caché (cache: "force-cache")
  const initial = toListData(await getCharactersPage(1));

  return (
    <main>
      <Hero total={initial.info.count} />

      <div id="explorador" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-24 sm:px-8">
        <CharacterExplorer initial={initial} />
      </div>
    </main>
  );
}
