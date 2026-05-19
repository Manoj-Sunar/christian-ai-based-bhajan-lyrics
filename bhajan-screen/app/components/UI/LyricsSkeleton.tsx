const LyricsSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-200 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 rounded" />
            <div className="h-3 w-4/6 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LyricsSkeleton;