import { Song } from "@/app/types";

interface IRecentList {
  recentBhajan: Song[];
}

export default function RecentList({
  recentBhajan,
}: IRecentList) {
  return (
    <div
      className="
        rounded-lg p-8
        bg-gradient-to-br
        from-surface
        to-surface-container
      "
    >
      <h2 className="text-4xl font-serif mb-8 text-on-surface">
        Recently Added
      </h2>

      <div className="space-y-6">
        {recentBhajan.map((item, index) => (
          <div
            key={item._id}
            className="
               w-fit
              group
              flex items-center gap-5
              pb-5
              transition-all duration-300
              cursor-pointer
            "
          >
            <div
              className="
                w-14 h-14 rounded-2xl
                bg-white
                flex items-center justify-center
                font-bold
                text-on-surface
                shadow-sm
                transition-colors duration-300
                group-hover:bg-secondary
                group-hover:text-white
              "
            >
              {index + 1}
            </div>

            <div>
              <h4
                className="
                  font-semibold text-lg
                  text-on-surface
                  transition-colors duration-300
                  group-hover:text-secondary
                "
              >
                {item.title}
              </h4>

              <p
                className="
                  text-sm text-on-surface-variant
                  transition-colors duration-300
                  group-hover:text-on-surface
                "
              >
                Spiritual • Recently Added
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}