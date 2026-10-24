"use client";

import { useEffect, useRef, useState } from "react";
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoFlaskOutline,
  IoRefresh,
  IoSearch,
  IoWarning,
} from "react-icons/io5";
import CharacterCard from "@/components/rickandmorty/CharacterCard";
import {
  buildCharactersUrl,
  EMPTY_FILTERS,
  hasActiveFilters,
  toListData,
} from "@/lib/rickandmorty";
import type {
  CharacterFilters,
  CharacterListData,
  CharacterResponse,
  CharacterStatus,
} from "@/types/rickandmorty";

const DEBOUNCE_MS = 500;
const RETRY_AFTER_MS = 10_000; // la API bloquea 10 s tras superar su límite
const MAX_AUTO_RETRIES = 3;

interface Option<T> {
  value: T;
  label: string;
  status?: CharacterStatus;
}

const STATUS_OPTIONS: Option<CharacterFilters["status"]>[] = [
  { value: "", label: "Todos" },
  { value: "alive", label: "Vivo", status: "Alive" },
  { value: "dead", label: "Muerto", status: "Dead" },
  { value: "unknown", label: "Desconocido", status: "unknown" },
];

const GENDER_OPTIONS: Option<CharacterFilters["gender"]>[] = [
  { value: "", label: "Todos" },
  { value: "female", label: "Femenino" },
  { value: "male", label: "Masculino" },
  { value: "genderless", label: "Sin género" },
  { value: "unknown", label: "Desconocido" },
];

// La API excede su límite de peticiones (429)
class ApiBusyError extends Error {}

interface Failure {
  url: string;
  busy: boolean;
  message: string;
}

async function searchCharacters(
  url: string,
  signal: AbortSignal,
): Promise<CharacterListData> {
  const res = await fetch(url, { signal });

  // La API responde 404 cuando ningún personaje coincide con los filtros
  if (res.status === 404) {
    return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
  }
  if (res.status === 429) throw new ApiBusyError();
  if (!res.ok) throw new Error(`La API respondió con el estado ${res.status}`);

  return toListData((await res.json()) as CharacterResponse);
}

function ChipGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium rm-text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="rm-chip">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="rm-chip-face" data-status={option.status}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CharacterExplorer({ initial }: { initial: CharacterListData }) {
  const [filters, setFilters] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [debounced, setDebounced] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [cache, setCache] = useState<Record<string, CharacterListData>>({});
  const [stale, setStale] = useState<CharacterListData | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const retries = useRef<Record<string, number>>({});
  const resultsRef = useRef<HTMLElement>(null);

  // Espera a que el usuario deje de escribir antes de consultar la API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(filters);
      setPage(1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters]);

  // Sin filtros y en la página 1 se reutiliza la lista que ya llegó renderizada del servidor
  const isInitial = page === 1 && !hasActiveFilters(debounced);
  const requestUrl = buildCharactersUrl(debounced, page);
  const fresh = isInitial ? initial : cache[requestUrl];

  // Búsqueda en el cliente (CSR): cada cambio de filtros o de página consulta la API
  useEffect(() => {
    if (isInitial || fresh) return;

    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    searchCharacters(requestUrl, controller.signal)
      .then((data) => {
        setCache((current) => ({ ...current, [requestUrl]: data }));
        setStale(data);
        setFailure(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;

        // Cuando la API responde 429 no envía cabeceras CORS, así que el navegador lo
        // reporta como TypeError ("Failed to fetch"): se trata igual que un 429
        const busy = error instanceof ApiBusyError || error instanceof TypeError;
        const used = retries.current[requestUrl] ?? 0;

        setFailure({
          url: requestUrl,
          busy,
          message: error instanceof Error ? error.message : "Error desconocido",
        });

        if (busy && used < MAX_AUTO_RETRIES) {
          retries.current[requestUrl] = used + 1;
          retryTimer = setTimeout(() => setRetryNonce((current) => current + 1), RETRY_AFTER_MS);
        }
      });

    return () => {
      controller.abort();
      clearTimeout(retryTimer);
    };
  }, [isInitial, fresh, requestUrl, retryNonce]);

  const isTyping = filters !== debounced;
  const error = !isInitial && !fresh && failure?.url === requestUrl ? failure : null;
  const isLoading = isTyping || (!fresh && !error);
  const data = fresh ?? stale;
  const showSkeleton = !data || (isLoading && data.results.length === 0);

  function updateFilter<K extends keyof CharacterFilters>(
    key: K,
    value: CharacterFilters[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setDebounced(EMPTY_FILTERS);
    setPage(1);
  }

  function retryNow() {
    retries.current[requestUrl] = 0;
    setFailure(null);
    setRetryNonce((current) => current + 1);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="rm-panel grid gap-5 p-4 sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_17rem]">
          <div>
            <label htmlFor="filter-name" className="mb-2 block text-sm font-medium rm-text-muted">
              Nombre
            </label>
            <div className="relative">
              <IoSearch
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rm-text-faint"
              />
              <input
                id="filter-name"
                type="search"
                value={filters.name}
                onChange={(event) => updateFilter("name", event.target.value)}
                placeholder="Rick, Morty, Pickle…"
                autoComplete="off"
                className="rm-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-type" className="mb-2 block text-sm font-medium rm-text-muted">
              Tipo
            </label>
            <div className="relative">
              <IoFlaskOutline
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rm-text-faint"
              />
              <input
                id="filter-type"
                type="search"
                value={filters.type}
                onChange={(event) => updateFilter("type", event.target.value)}
                placeholder="Parasite, Clone…"
                autoComplete="off"
                className="rm-input"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ChipGroup
            name="status"
            legend="Estado"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(value) => updateFilter("status", value)}
          />
          <ChipGroup
            name="gender"
            legend="Género"
            options={GENDER_OPTIONS}
            value={filters.gender}
            onChange={(value) => updateFilter("gender", value)}
          />
        </div>
      </form>

      <section ref={resultsRef} className="scroll-mt-24 pt-10" aria-busy={isLoading}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div aria-live="polite">
            <p className="rm-display text-3xl sm:text-4xl">
              {data ? `${data.info.count} personajes` : error ? "Búsqueda en pausa" : "Buscando…"}
            </p>
            <p className="mt-1 min-h-5 text-sm rm-text-muted">
              {data && data.info.pages > 0 && `Página ${page} de ${data.info.pages}`}
              {isLoading && data ? ", actualizando…" : ""}
            </p>
          </div>

          {hasActiveFilters(filters) && (
            <button type="button" onClick={clearFilters} className="rm-btn">
              <IoClose size={18} /> Limpiar filtros
            </button>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="rm-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "rgb(255 106 125 / 0.45)" }}
          >
            <div className="flex items-start gap-3">
              <IoWarning size={26} className="mt-0.5 shrink-0" style={{ color: "var(--rm-yellow)" }} />
              <div>
                <p className="font-semibold">
                  {error.busy
                    ? "La API de Rick and Morty está limitando las peticiones"
                    : "No se pudo completar la búsqueda"}
                </p>
                <p className="mt-1 text-sm rm-text-muted">
                  {error.busy
                    ? "Pasa cuando se piden muchas fichas seguidas. Se reintentará sola en unos segundos."
                    : error.message}
                </p>
              </div>
            </div>
            <button type="button" onClick={retryNow} className="rm-btn shrink-0">
              <IoRefresh size={18} /> Reintentar ahora
            </button>
          </div>
        ) : showSkeleton ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="rm-arch aspect-[1/1.12] bg-white/5" />
                <div className="mt-3 h-5 w-3/4 rounded bg-white/5" />
                <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : data.results.length === 0 ? (
          <div className="rm-panel p-10 text-center">
            <p className="rm-display text-2xl">Ningún personaje coincide</p>
            <p className="mx-auto mt-2 max-w-md rm-text-muted">
              Prueba con otro nombre o quita alguno de los filtros para ver más resultados.
            </p>
            <button type="button" onClick={clearFilters} className="rm-btn rm-btn-primary mt-6">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 gap-x-5 gap-y-8 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {data.results.map((character, index) => (
              <CharacterCard
                key={character.id}
                character={character}
                gated={!isInitial}
                delay={300 + (index % 5) * 60}
              />
            ))}
          </div>
        )}

        {data && data.info.pages > 1 && !error && (
          <nav
            aria-label="Paginación"
            className="mt-12 grid grid-cols-2 items-center gap-3 sm:flex sm:justify-center sm:gap-4"
          >
            <span className="col-span-2 text-center text-sm rm-text-muted sm:order-2 sm:col-auto sm:min-w-28">
              Página {page} de {data.info.pages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="rm-btn sm:order-1"
            >
              <IoChevronBack size={18} /> Anterior
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= data.info.pages || isLoading}
              className="rm-btn sm:order-3"
            >
              Siguiente <IoChevronForward size={18} />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
