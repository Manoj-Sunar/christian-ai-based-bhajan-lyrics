export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between">
        
        <h1 className="text-lg md:text-xl font-bold text-indigo-600">
          Nepali Christian Bhajan
        </h1>

        <input
          type="text"
          placeholder="Search songs..."
          className="hidden sm:block w-72 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </header>
  );
}