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

// La API admite pedir varios ids a la vez (/character/1,2,3). Se consultan en lotes
// de 100 para no superar su límite de peticiones al generar los 826 detalles
const CHUNK_SIZE = 100;
const MAX_RETRIES = 4;
const MAX_WAIT_MS = 15_000;

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

// La API responde 429 con la cabecera Retry-After cuando recibe muchas peticiones seguidas
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, init);

    if (res.status !== 429 || attempt === MAX_RETRIES) return res;

    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Math.min((retryAfter > 0 ? retryAfter : 2 ** attempt) * 1000, MAX_WAIT_MS);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

// Página del listado con la respuesta forzada en caché (SSG)
export async function getCharactersPage(page = 1): Promise<CharacterResponse> {
  const res = await fetchWithRetry(`${API_URL}/character?page=${page}`, {
    cache: "force-cache",
  });

  if (!res.ok) throw new Error(`Error al cargar los personajes (HTTP ${res.status})`);

  return res.json();
}

// Total de personajes: los ids de la API son consecutivos (1..count)
export async function getTotalCharacters(): Promise<number> {
  const { info } = await getCharactersPage(1);

  return info.count;
}

// Un lote de personajes, regenerado cada 10 días (ISR)
async function getCharacterChunk(chunk: number): Promise<Character[]> {
  const firstId = chunk * CHUNK_SIZE + 1;
  const ids = Array.from({ length: CHUNK_SIZE }, (_, index) => firstId + index);

  const res = await fetchWithRetry(`${API_URL}/character/${ids.join(",")}`, {
    next: { revalidate: DETAIL_REVALIDATE },
  });

  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Error al cargar el personaje (HTTP ${res.status})`);

  // Con un solo id la API devuelve un objeto en lugar de una lista
  const data: Character | Character[] = await res.json();

  return Array.isArray(data) ? data : [data];
}

// Detalle de un personaje. Devuelve null si no existe
export async function getCharacter(id: string): Promise<Character | null> {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) return null;

  const characters = await getCharacterChunk(Math.floor((numericId - 1) / CHUNK_SIZE));

  return characters.find((character) => character.id === numericId) ?? null;
}
