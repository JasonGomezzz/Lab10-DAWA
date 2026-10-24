export default function PokemonLoading() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-pulse">
        <div className="bg-linear-to-r from-black to-gray-500 p-8">
          <div className="h-12 w-64 mx-auto rounded bg-white/30" />
          <div className="h-6 w-20 mx-auto mt-4 rounded bg-white/30" />
        </div>

        <div className="p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex justify-center items-center">
            <div className="w-64 h-64 rounded-full bg-gray-200" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="h-10 w-40 rounded-full bg-gray-200" />
            <div className="h-8 w-48 rounded bg-gray-200" />
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-3 w-full rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
