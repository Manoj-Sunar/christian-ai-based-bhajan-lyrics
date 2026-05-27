export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20 py-16 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12">
        <div>
          <h2 className="font-serif text-3xl">
            Bhajan AI
          </h2>

          <p className="text-gray-500 mt-4 max-w-md">
            Ancient wisdom powered by modern AI.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-3">
            <h4 className="font-semibold">Explore</h4>
            <p>Newest</p>
            <p>Featured</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Community</h4>
            <p>Support</p>
            <p>Forums</p>
          </div>
        </div>
      </div>
    </footer>
  );
}