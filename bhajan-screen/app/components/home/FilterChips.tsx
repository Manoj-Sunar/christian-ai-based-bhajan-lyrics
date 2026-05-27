const chips = [
  "Praise",
  "Prayer",
  "Hope",
  "Healing",
  "Hindi",
  "Nepali",
  "Popular",
];

export default function FilterChips() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {chips.map((chip) => (
        <button
          key={chip}
          className="px-4 py-2 rounded-full border hover:bg-black hover:text-white transition"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}