import type {
  Character,
  CharacterFilters,
  CharacterGender,
  CharacterListData,
  CharacterResponse,
  CharacterStatus,
  CharacterSummary,
} from "@/types/rickandmorty";

export const API_URL = "https://rickandmortyapi.com/api";

// 10 días en segundos: tiempo de revalidación (ISR) del detalle de cada personaje
export const DETAIL_REVALIDATE = 60 * 60 * 24 * 10;

export const EMPTY_FILTERS: CharacterFilters = {
  name: "",
  status: "",
  type: "",
  gender: "",
};

export const STATUS_LABELS: Record<CharacterStatus, string> = {
  Alive: "Vivo",
  Dead: "Muerto",
  unknown: "Desconocido",
};

export const GENDER_LABELS: Record<CharacterGender, string> = {
  Female: "Femenino",
  Male: "Masculino",
  Genderless: "Sin género",
  unknown: "Desconocido",
};

export function hasActiveFilters(filters: CharacterFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== "");
}

// Arma la URL de búsqueda; solo envía los filtros que tienen valor
export function buildCharactersUrl(filters: CharacterFilters, page = 1): string {
  const params = new URLSearchParams({ page: String(page) });

  for (const [key, value] of Object.entries(filters)) {
    const clean = value.trim();
    if (clean) params.set(key, clean);
  }

  return `${API_URL}/character/?${params}`;
}

export function toSummary(character: Character): CharacterSummary {
  return {
    id: character.id,
    name: character.name,
    status: character.status,
    species: character.species,
    gender: character.gender,
    image: character.image,
    location: character.location.name,
  };
}

export function toListData(response: CharacterResponse): CharacterListData {
  return { info: response.info, results: response.results.map(toSummary) };
}

// Página del listado con la respuesta forzada en caché (SSG)
export async function getCharactersPage(page = 1): Promise<CharacterResponse> {
  const res = await fetch(`${API_URL}/character?page=${page}`, {
    cache: "force-cache",
  });

  if (!res.ok) throw new Error("Error al cargar los personajes");

  return res.json();
}

// Recorre todas las páginas de la API para conocer el id de cada personaje
export async function getAllCharacterIds(): Promise<number[]> {
  const first = await getCharactersPage(1);
  const ids = first.results.map((character) => character.id);

  for (let page = 2; page <= first.info.pages; page++) {
    const { results } = await getCharactersPage(page);
    ids.push(...results.map((character) => character.id));
  }

  return ids;
}

// Detalle de un personaje, regenerado cada 10 días (ISR). Devuelve null si no existe
export async function getCharacter(id: string): Promise<Character | null> {
  const res = await fetch(`${API_URL}/character/${id}`, {
    next: { revalidate: DETAIL_REVALIDATE },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al cargar el personaje");

  return res.json();
}
