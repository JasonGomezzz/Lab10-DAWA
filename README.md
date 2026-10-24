# Lab 10 - Pokédex y Rick and Morty con Next.js (SSG + ISR)

Laboratorio de Desarrollo de Aplicaciones Web Avanzado (TECSUP): enrutamiento y páginas en Next.js con App Router. Incluye dos aplicaciones en el mismo proyecto:

- **Pokédex** (`/pokemon`): los 151 pokémon de la primera generación con la [PokeAPI](https://pokeapi.co/).
- **Rick and Morty** (`/`): los 826 personajes con la [Rick and Morty API](https://rickandmortyapi.com/documentation/#character). Es la tarea del laboratorio.

## Requisitos

- Node.js 18.18 o superior (probado con 22.18)
- npm
- Acceso a `https://pokeapi.co`, `https://rickandmortyapi.com` y `https://raw.githubusercontent.com`

## Instalación y ejecución

```bash
npm install
npm run dev      # desarrollo en http://localhost:3000
npm run build    # build de producción
npm start        # sirve el build de producción
```

## Estructura

```
src/
├── types/
│   ├── pokemon.ts                  # tipado de la PokeAPI
│   └── rickandmorty.ts             # tipado de personajes, filtros y paginación
├── lib/rickandmorty.ts             # cliente de la API (caché forzado, ISR, lotes y reintentos)
├── components/rickandmorty/
│   ├── Hero.tsx                    # portada: titular, portal animado y tres personajes
│   ├── PortalArt.tsx               # portal SVG de aros animados (completo en el hero, solo aros en el detalle y el 404)
│   ├── CharacterExplorer.tsx       # buscador en tiempo real (Client Component): filtros, paginación, caché y reintentos
│   ├── CharacterCard.tsx           # tarjeta del listado: retrato en arco, nombre, estado, especie y ubicación
│   ├── CharacterAvatar.tsx         # imagen con lazy loading, carga diferida por visibilidad (gated) y reintentos
│   └── StatusBadge.tsx             # insignia de estado (vivo, muerto, desconocido); el color sale de data-status
└── app/
    ├── layout.tsx                  # layout raíz (fuente Geist)
    ├── not-found.tsx               # 404 de la Pokédex y de rutas inexistentes
    ├── pokemon/                    # Pokédex (layout, lista, error, [name] y loading)
    └── (rickandmorty)/             # grupo de rutas: no cambia la URL
        ├── layout.tsx              # navegación, pie, metadata y fuente Bricolage Grotesque
        ├── rickandmorty.css        # tokens de color, retratos en arco y animaciones del grupo
        ├── page.tsx                # portada: hero y listado de personajes
        ├── error.tsx               # error boundary con reintento
        ├── not-found.tsx           # personaje inexistente
        └── character/[id]/
            ├── page.tsx            # detalle: SSG + ISR
            └── loading.tsx         # esqueleto de carga
```

