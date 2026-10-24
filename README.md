# Lab 10 - Pokédex con Next.js (SSG + ISR)

Laboratorio de Desarrollo de Aplicaciones Web Avanzado (TECSUP): enrutamiento y páginas en Next.js con App Router. El Pokédex lista los 151 pokémon de la primera generación consumiendo la [PokeAPI](https://pokeapi.co/), con generación estática (SSG) y regeneración incremental (ISR).

## Requisitos

- Node.js 18.18 o superior (probado con 22.18)
- npm
- Acceso a `https://pokeapi.co` y `https://raw.githubusercontent.com` (imágenes)

## Instalación y ejecución

```bash
npm install
npm run dev      # desarrollo en http://localhost:3000/pokemon
npm run build    # build de producción
npm start        # sirve el build de producción
```

## Estructura

```
src/
├── types/pokemon.ts            # tipado de las respuestas de la PokeAPI
└── app/
    ├── not-found.tsx           # 404 personalizado (rutas inexistentes y notFound())
    └── pokemon/
        ├── layout.tsx          # barra de navegación y metadata del Pokédex
        ├── page.tsx            # lista de 151 pokémon (ISR)
        ├── error.tsx           # error boundary con botón de reintento
        └── [name]/
            ├── page.tsx        # detalle: SSG (generateStaticParams) + ISR
            └── loading.tsx     # esqueleto mientras se resuelve el detalle
```

## Rutas

| Ruta | Estrategia |
| --- | --- |
| `/pokemon` | `fetch` con `next: { revalidate: 86400 }`: se prerenderiza y se revalida cada 24 h (ISR) |
| `/pokemon/[name]` | `generateStaticParams` prerenderiza los 151 nombres en el build (SSG); cada `fetch` revalida cada 24 h (ISR) |
| cualquier otra | `not-found.tsx` |

## Cómo probar

1. `npm run dev` y abrir `/pokemon`: debe mostrar la cuadrícula de 151 pokémon.
2. Entrar a un pokémon (por ejemplo `/pokemon/pikachu`): muestra tipos, estadísticas y habilidades.
3. Abrir `/pokemon/nombre-inexistente` o `/ruta-inexistente`: muestra el 404 personalizado.
4. `npm run build`: la tabla de rutas lista `/pokemon` y `/pokemon/[name]` con `Revalidate 1d` y las 151 rutas generadas.
5. `npm start` para servir el build.

## Desviaciones respecto al enunciado

El proyecto se generó con `create-next-app` 16.4.3, que activa `cacheComponents` y `partialPrefetching` por defecto (ver `next.config.ts`). Se mantuvieron activados y el código del enunciado funciona con ellos, con estos ajustes:

- `params` se tipa como `Promise<{ name: string }>` y se resuelve con `await`, como exige esta versión.
- `error.tsx` usa la prop `retry()` de esta versión para reintentar (`reset()` queda como alternativa).
- `getPokemon` llama a `notFound()` si la PokeAPI responde 404 (en lugar de lanzar un error), para que un nombre inexistente muestre `not-found.tsx` y los demás fallos muestren `error.tsx`.
- Se agregó `[name]/loading.tsx`: con `cacheComponents`, resolver `params` sin un `<Suspense>` produce un error de prerender en segundo plano al visitar un nombre fuera de `generateStaticParams`.
- `not-found.tsx` se ubica en `src/app` para cubrir también las rutas que no existen en absoluto.
- En el layout se usa `bg-black/30` en lugar de `bg-opacity-30`, que ya no existe en Tailwind CSS 4.
- Se quitaron los imports sin uso de `page.tsx` y el bloque de código comentado del layout.

## Repositorio

https://github.com/JasonGomezzz/Lab10-DAWA
