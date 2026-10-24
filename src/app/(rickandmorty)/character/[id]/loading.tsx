export default function CharacterLoading() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8" aria-busy="true">
      <div className="h-11 w-56 motion-safe:animate-pulse rounded-full bg-white/5" />

      <div className="mt-10 grid items-center gap-14 lg:grid-cols-[minmax(0,25rem)_1fr]">
        <div className="rm-arch mx-auto aspect-[1/1.12] w-full max-w-sm motion-safe:animate-pulse bg-white/5" />

        <div>
          <div className="h-5 w-24 motion-safe:animate-pulse rounded bg-white/5" />
          <div className="mt-4 h-20 w-3/4 motion-safe:animate-pulse rounded bg-white/5" />
          <div className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="border-t border-white/10 py-4">
                <div className="h-4 w-20 motion-safe:animate-pulse rounded bg-white/5" />
                <div className="mt-2 h-6 w-2/3 motion-safe:animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
