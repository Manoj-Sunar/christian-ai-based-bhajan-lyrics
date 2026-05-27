interface VerseItemProps {
  title: string;
  BhajanNumber: number;
  className?: string;
}

export default function VerseItem({
  title,
  BhajanNumber,
  className,
}: VerseItemProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      
      {/* Number */}
      <div className="
        w-14 h-14
        rounded-xl
        bg-gradient-to-br from-purple-500 to-pink-500
        flex items-center justify-center
        text-white font-bold text-lg
        shadow-xs
      ">
        {BhajanNumber}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h2 className="
          text-lg
          font-semibold
          truncate
          group-hover:text-pink-400
          transition
        ">
          {title}
        </h2>

        <p className="text-sm text-zinc-400 mt-1">
          Worship Lyrics
        </p>
      </div>

      {/* Arrow */}
      <div className="
        opacity-40
        group-hover:opacity-100
        group-hover:translate-x-1
        transition-all
      ">
        →
      </div>
    </div>
  );
}