export default function TranslationCard() {
  return (
    <div className="space-y-8">
      <div className="bg-black text-white rounded-3xl p-8">
        <h3 className="text-3xl font-serif">
          Most Translated
        </h3>

        <div className="mt-8 space-y-4">
          <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
            <span>Gayatri Mantra</span>
            <span className="text-sm">
              42 Languages
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
            <span>Om Namah Shivaya</span>
            <span className="text-sm">
              38 Languages
            </span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-100 rounded-3xl p-8 text-center">
        <h3 className="text-3xl font-serif">
          Request Interpretation
        </h3>

        <p className="mt-4 text-gray-700">
          Submit lyrics for AI analysis.
        </p>

        <button className="mt-6 bg-black text-white px-6 py-3 rounded-full">
          Submit
        </button>
      </div>
    </div>
  );
}