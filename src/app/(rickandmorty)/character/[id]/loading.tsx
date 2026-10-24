export default function CharacterLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">
      <div className="h-5 w-48 animate-pulse rounded bg-slate-800" />

      <div className="mt-6 grid gap-8 md:grid-cols-[20rem_1fr]">
        <div className="aspect-square animate-pulse rounded-2xl bg-slate-800" />

        <div>
          <div className="h-12 w-3/4 animate-pulse rounded bg-slate-800" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl border border-white/10 bg-slate-900"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
