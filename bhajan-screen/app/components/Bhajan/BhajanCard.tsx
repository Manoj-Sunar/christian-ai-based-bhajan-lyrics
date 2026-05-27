
type Props = {
  title: string;
  description: string;
  tag: string[];
};

export default function BhajanCard({
  title,
  description,
  tag,
}: Props) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-xs transition">
      <span className="text-sm border px-3 py-1 rounded-full">
        {tag}
      </span>

      <h3 className="mt-5 text-2xl font-serif">
        {title}
      </h3>

      <p className="mt-4 text-gray-600 leading-7">
        {description}
      </p>

      <button className="mt-6 text-sm font-semibold">
        Read More →
      </button>
    </div>
  );
}