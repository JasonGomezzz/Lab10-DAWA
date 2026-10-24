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

**Por qué CSR en la búsqueda.** Los filtros dependen de lo que escribe el usuario en cada momento, algo que no se puede conocer en el build. El buscador (`useState` + `useEffect`) consulta la API desde el navegador con un debounce de 500 ms, cancela la petición anterior con `AbortController`, guarda en memoria cada resultado y pagina. Sin filtros reutiliza la lista que llegó renderizada del servidor.

**Límite de peticiones de la API.** La API responde `429` con `Retry-After` de 10 s tras unas 40 peticiones seguidas, y ese límite también aplica a las imágenes. Por eso:

- El detalle se lee en lotes de 100 ids (`/character/1,2,...,100`), 9 peticiones en total en lugar de 826.
- `generateStaticParams` solo pide el total (los ids son consecutivos, 1 a 826).
- Las lecturas del servidor reintentan ante un `429` respetando `Retry-After`.
- La respuesta `429` de la API no incluye cabeceras CORS, así que en el navegador no llega como estado `429` sino como `TypeError: Failed to fetch`. El buscador trata ese `TypeError` (y un `429` visible, si llegara) como límite de la API: muestra un mensaje que explica qué pasó, reintenta solo a los 10 s (hasta 3 veces) y ofrece **Reintentar ahora**, que reinicia el conteo. Un `TypeError` también puede deberse a una conexión caída y se trata igual. Cualquier otro error (por ejemplo un HTTP 500) muestra su mensaje con el mismo botón, sin reintento automático.
- Para no llegar al límite desde el navegador: debounce de 500 ms al escribir y caché de resultados en memoria por URL de búsqueda y página (se pierde al recargar).
- Los avatares de los resultados de búsqueda solo se piden si la tarjeta entra en pantalla (con 120 px de margen) y sigue montada tras 300 ms (más hasta 240 ms de escalonado entre tarjetas), así las listas intermedias al escribir no gastan peticiones. La lista inicial del servidor usa `loading="lazy"` sin esa espera.
- Los avatares se sirven sin pasar por el optimizador de Next (`unoptimized`); si uno falla se reintenta hasta 3 veces con espera creciente (4, 8 y 12 s) y, agotados los intentos, se muestra un marcador.

## Diseño

- **Tipografía:** Bricolage Grotesque para los títulos (cargada con `next/font` en el layout del grupo) y Geist para el texto (cargada en el layout raíz).
- **Paleta:** fondo índigo; el verde portal se reserva para el portal, el estado "vivo" y las acciones activas (botón principal, filtro seleccionado y foco del campo de texto).
- **Retratos en arco:** el marco usa el color del estado mediante `data-status` (verde vivo, coral muerto, amarillo desconocido); el mismo color tiñe la insignia y el resplandor al pasar el cursor.
- **Hero:** portal SVG de aros animados del que salen tres personajes (Rick, Morty y Summer); es la única animación de entrada de la página.
- **Fotos:** al terminar de cargar, la foto de cada retrato emerge del portal con `clip-path`.
- **Movimiento reducido:** con `prefers-reduced-motion` se desactivan la entrada del hero, el giro de los aros, la emergencia de las fotos y las transiciones de las tarjetas.

## Cómo probar

1. `npm run dev` y abrir `/`: hero con el portal y listado de personajes. Escribir en **Nombre** o **Tipo** y cambiar **Estado** o **Género**: la lista se actualiza sola.
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
- La prop `priority` de `next/image` está en desuso en Next 16; en la tarea se usa `loading="eager"` solo en la imagen principal del detalle y en los tres personajes del hero.
- El CSS del grupo define `html:has(.rm-root)` con fondo oscuro y `color-scheme: dark` para que el rebote de scroll de macOS no muestre blanco.

## Repositorio

https://github.com/JasonGomezzz/Lab10-DAWA
