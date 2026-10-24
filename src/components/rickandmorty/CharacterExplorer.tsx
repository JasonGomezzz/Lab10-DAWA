"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
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
} from "@/types/rickandmorty";

const DEBOUNCE_MS = 350;

const STATUS_OPTIONS: { value: CharacterFilters["status"]; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "alive", label: "Vivo" },
  { value: "dead", label: "Muerto" },
  { value: "unknown", label: "Desconocido" },
];

const GENDER_OPTIONS: { value: CharacterFilters["gender"]; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "female", label: "Femenino" },
  { value: "male", label: "Masculino" },
  { value: "genderless", label: "Sin género" },
  { value: "unknown", label: "Desconocido" },
];

const CONTROL_CLASS =
  "w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40";

const PAGE_BUTTON_CLASS =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

// Última respuesta (o error) que llegó para una URL concreta
interface SettledRequest {
  url: string;
  data: CharacterListData | null;
  error: string | null;
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
  if (!res.ok) throw new Error(`La API respondió con el estado ${res.status}`);

  return toListData((await res.json()) as CharacterResponse);
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wide text-slate-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CharacterExplorer({ initial }: { initial: CharacterListData }) {
  const [filters, setFilters] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [debounced, setDebounced] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [settled, setSettled] = useState<SettledRequest | null>(null);
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

  // Búsqueda en el cliente (CSR): cada cambio de filtros o de página consulta la API
  useEffect(() => {
    if (isInitial) return;

    const controller = new AbortController();

    searchCharacters(requestUrl, controller.signal)
      .then((data) => setSettled({ url: requestUrl, data, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSettled({
          url: requestUrl,
          data: null,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      });

    return () => controller.abort();
  }, [isInitial, requestUrl]);

  const isTyping = filters !== debounced;
  const isCurrent = settled?.url === requestUrl;
  const isLoading = isTyping || (!isInitial && !isCurrent);
  const data = isInitial ? initial : (settled?.data ?? null);
  const error = !isInitial && settled && isCurrent ? settled.error : null;
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

  function goToPage(nextPage: number) {
    setPage(nextPage);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Field label="Nombre" htmlFor="filter-name">
          <input
            id="filter-name"
            type="search"
            value={filters.name}
            onChange={(event) => updateFilter("name", event.target.value)}
            placeholder="Ej. Rick"
            autoComplete="off"
            className={CONTROL_CLASS}
          />
        </Field>

        <Field label="Estado" htmlFor="filter-status">
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value as CharacterFilters["status"])
            }
            className={CONTROL_CLASS}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo" htmlFor="filter-type">
          <input
            id="filter-type"
            type="search"
            value={filters.type}
            onChange={(event) => updateFilter("type", event.target.value)}
            placeholder="Ej. Parasite"
            autoComplete="off"
            className={CONTROL_CLASS}
          />
        </Field>

        <Field label="Género" htmlFor="filter-gender">
          <select
            id="filter-gender"
            value={filters.gender}
            onChange={(event) =>
              updateFilter("gender", event.target.value as CharacterFilters["gender"])
            }
            className={CONTROL_CLASS}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </form>

      <section ref={resultsRef} className="mt-8 scroll-mt-20" aria-busy={isLoading}>
        <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400" aria-live="polite">
            {data
              ? `${data.info.count} personajes${
                  data.info.pages > 0 ? ` · Página ${page} de ${data.info.pages}` : ""
                }`
              : "Buscando personajes…"}
            {isLoading && data ? " · actualizando…" : ""}
          </p>

          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IoClose size={16} /> Limpiar filtros
            </button>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200"
          >
            <IoWarning size={24} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">No se pudo completar la búsqueda</p>
              <p className="mt-1 text-sm text-red-200/80">{error}</p>
            </div>
          </div>
        ) : showSkeleton ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className="aspect-3/4 animate-pulse rounded-2xl border border-white/10 bg-slate-900"
              />
            ))}
          </div>
        ) : data.results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-lg font-semibold">Ningún personaje coincide con tu búsqueda</p>
            <p className="mt-1 text-sm text-slate-400">
              Prueba con otro nombre o quita alguno de los filtros.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}

        {data && data.info.pages > 1 && !error && (
          <nav
            aria-label="Paginación"
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className={PAGE_BUTTON_CLASS}
            >
              <IoChevronBack size={16} /> Anterior
            </button>
            <span className="text-sm text-slate-400">
              Página {page} de {data.info.pages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= data.info.pages || isLoading}
              className={PAGE_BUTTON_CLASS}
            >
              Siguiente <IoChevronForward size={16} />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
