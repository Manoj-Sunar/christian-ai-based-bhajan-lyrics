export default function SearchBar() {
  return (
    <div className="bg-white shadow-xl rounded-full p-2 flex items-center">
      <input
        type="text"
        placeholder="Search bhajans..."
        className="flex-1 px-6 py-4 outline-none bg-transparent"
      />

      <button className="bg-black text-white px-8 py-4 rounded-full">
        Search
      </button>
    </div>
  );
}