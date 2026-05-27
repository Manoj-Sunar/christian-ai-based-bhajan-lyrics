import FilterChips from "./FilterChips";
import SearchBar from "./SearchBar";


export default function Hero() {
  return (
    <section className="px-6 lg:px-16 py-24 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl lg:text-7xl font-medium leading-tight">
          Understand Bhajans with AI
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Translate and understand spiritual lyrics
          with intelligent interpretation.
        </p>

        <div className="mt-10">
          <SearchBar />
        </div>

        <div className="mt-8">
          <FilterChips/>
        </div>
      </div>
    </section>
  );
}