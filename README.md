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
│   ├── CharacterExplorer.tsx       # buscador en tiempo real (Client Component)
│   ├── CharacterCard.tsx           # tarjeta del listado
│   ├── CharacterAvatar.tsx         # imagen con lazy loading y reintentos
│   └── StatusBadge.tsx             # insignia de estado (vivo, muerto, desconocido)
└── app/
    ├── layout.tsx                  # layout raíz
    ├── not-found.tsx               # 404 de la Pokédex y de rutas inexistentes
    ├── pokemon/                    # Pokédex (layout, lista, error, [name] y loading)
    └── (rickandmorty)/             # grupo de rutas: no cambia la URL
        ├── layout.tsx              # navegación y metadata
        ├── page.tsx                # portada: listado de personajes
        ├── error.tsx               # error boundary con reintento
        ├── not-found.tsx           # personaje inexistente
        └── character/[id]/
            ├── page.tsx            # detalle: SSG + ISR
            └── loading.tsx         # esqueleto de carga
```

## Rutas

| Ruta | Renderizado |
| --- | --- |
| `/` | Server Component con `fetch(..., { cache: "force-cache" })`: se prerenderiza en el build (SSG). El buscador llega como Client Component |
| `/character/[id]` | `generateStaticParams` genera las 826 rutas en el build (SSG) y los datos se revalidan cada 10 días con `next: { revalidate: 864000 }` (ISR) |
| `/pokemon` | `revalidate: 86400`: se revalida cada 24 h (ISR) |
| `/pokemon/[name]` | `generateStaticParams` genera 151 rutas (SSG) y revalida cada 24 h (ISR) |

## Rick and Morty: decisiones técnicas

**Por qué SSG en la portada.** El listado inicial (primera página de la API) cambia muy rara vez y es igual para todos los usuarios, así que se genera una sola vez en el build con la petición forzada en caché. Se sirve como HTML estático desde la CDN, sin consultar la API en cada visita.

**Por qué SSG + ISR en el detalle.** Cada personaje es una ruta conocida de antemano (ids 1 al total), por lo que `generateStaticParams` los genera todos en el build y cada ficha carga al instante. Los datos de un personaje casi no cambian, pero pueden corregirse, así que `revalidate` de 10 días regenera la ficha en segundo plano sin volver a desplegar. Se usó el id (y no el nombre) porque es único: hay decenas de personajes llamados "Rick" o "Morty".

**Por qué CSR en la búsqueda.** Los filtros dependen de lo que escribe el usuario en cada momento, algo que no se puede conocer en el build. El buscador (`useState` + `useEffect`) consulta la API desde el navegador con un debounce de 350 ms, cancela la petición anterior con `AbortController` y pagina los resultados. Sin filtros reutiliza la lista que llegó renderizada del servidor.

**Límite de peticiones de la API.** La API responde `429` con `Retry-After` de 10 s tras unas 40 peticiones seguidas, y ese límite también aplica a las imágenes. Por eso:

- El detalle se lee en lotes de 100 ids (`/character/1,2,...,100`), 9 peticiones en total en lugar de 826.
- `generateStaticParams` solo pide el total (los ids son consecutivos, 1 a 826).
- Las lecturas del servidor reintentan ante un `429` respetando `Retry-After`.
- Los avatares se sirven sin pasar por el optimizador de Next (`unoptimized`); si uno recibe `429` se reintenta con espera creciente y, agotados los intentos, se muestra un marcador.
- Si el buscador recibe un `429`, avisa al usuario en lugar de mostrar una lista vacía.

## Cómo probar

1. `npm run dev` y abrir `/`: lista de personajes. Escribir en **Nombre** o **Tipo** y cambiar **Estado** o **Género**: la lista se actualiza sola.
2. Entrar a un personaje (por ejemplo `/character/1`): muestra todos los campos de la API y sus episodios.
3. Abrir `/character/9999` o `/character/abc`: muestra la página de personaje no encontrado.
4. Abrir `/pokemon` y `/pokemon/pikachu` para la Pokédex, o `/ruta-inexistente` para el 404 general.
5. `npm run build`: la tabla de rutas muestra `/character/[id]` con `Revalidate 10d` y `/pokemon` con `1d`.

## Despliegue en Vercel

1. Subir el repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importar el repositorio. Next.js se detecta solo, sin variables de entorno ni configuración extra.
3. Pulsar **Deploy**. El build genera 984 páginas (826 personajes, 151 pokémon y las rutas base).

## Desviaciones respecto al enunciado

El proyecto se generó con `create-next-app` 16.4.3, que activa `cacheComponents` y `partialPrefetching` por defecto (ver `next.config.ts`). Se mantuvieron activados y el código del enunciado funciona con ellos, con estos ajustes:

- `params` se tipa como `Promise<{ ... }>` y se resuelve con `await`, como exige esta versión.
- `error.tsx` usa la prop `retry()` de esta versión para reintentar (`reset()` queda como alternativa).
- `getPokemon` llama a `notFound()` si la PokeAPI responde 404, para que un nombre inexistente muestre `not-found.tsx` y los demás fallos muestren `error.tsx`.
- Se agregaron `loading.tsx` en `pokemon/[name]` y en `character/[id]`: con `cacheComponents`, resolver `params` sin un `<Suspense>` produce un error de prerender al visitar un valor fuera de `generateStaticParams`. Por el mismo motivo, un id inexistente responde con la página de no encontrado pero con estado HTTP 200 (la respuesta ya empezó a enviarse como streaming).
- `not-found.tsx` general se ubica en `src/app` para cubrir también las rutas que no existen en absoluto.
- En el layout de la Pokédex se usa `bg-black/30` en lugar de `bg-opacity-30`, que ya no existe en Tailwind CSS 4.
- Se quitaron los imports sin uso de `pokemon/page.tsx` y el bloque de código comentado del layout.
- La portada por defecto de `create-next-app` se reemplazó por el listado de Rick and Morty, y el título e idioma del layout raíz pasaron a "Lab 10" y `es`.
- La prop `priority` de `next/image` está en desuso en Next 16; en la tarea se usa `loading="eager"` solo en la imagen principal del detalle.

## Repositorio

https://github.com/JasonGomezzz/Lab10-DAWA
