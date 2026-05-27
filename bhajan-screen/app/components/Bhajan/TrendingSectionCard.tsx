
import { Song } from "@/app/types";
import BhajanCard from "./BhajanCard";

interface ITrendingBhajans{
  bhajans:Song[]
}


export default async function TrendingSection({bhajans}:ITrendingBhajans) {


   

  return (
    <section className="px-6 lg:px-16 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-serif">
            Trending Bhajans
          </h2>

          <p className="text-gray-500 mt-2">
            Most explored this week
          </p>
        </div>

        <button className="font-semibold">
          View All
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bhajans.map((item) => (
          <BhajanCard
            key={item._id}
            title={item.title}
            description={item.lyrics[0].lines[0]}
            tag={item.tags}
          />
        ))}
      </div>
    </section>
  );
}