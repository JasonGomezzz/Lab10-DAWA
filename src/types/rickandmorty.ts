export type CharacterStatus = "Alive" | "Dead" | "unknown";
export type CharacterGender = "Female" | "Male" | "Genderless" | "unknown";

export interface CharacterLocationRef {
  name: string;
  url: string;
}

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: CharacterLocationRef;
  location: CharacterLocationRef;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface CharacterResponse {
  info: ApiInfo;
  results: Character[];
}

// Versión liviana para el listado: evita enviar al cliente los episodios de cada personaje
export type CharacterSummary = Pick<
  Character,
  "id" | "name" | "status" | "species" | "gender" | "image"
> & { location: string };

export interface CharacterListData {
  info: ApiInfo;
  results: CharacterSummary[];
}

export interface CharacterFilters {
  name: string;
  status: "" | "alive" | "dead" | "unknown";
  type: string;
  gender: "" | "female" | "male" | "genderless" | "unknown";
}
