export default function SongToolbar() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
      
      {/* Search + Semantic Toggle */}
      <div className="flex gap-3">
        <input
          placeholder="Search by title, lyrics..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
        />

        <button className="px-4 py-2 text-xs font-bold border rounded-lg">
          Semantic AI
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {["Worship", "Praise", "Youth", "Gospel"].map((c) => (
          <button
            key={c}
            className="px-3 py-1 text-xs rounded-full border hover:bg-slate-50"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}