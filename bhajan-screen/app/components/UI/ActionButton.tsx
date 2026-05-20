import { ReactNode } from "react";

export default function ActionButton({
  icon,
  loading,
  children,
  ...props
}: {
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full h-[56px] rounded-2xl font-semibold flex items-center justify-center gap-2 bg-white border hover:bg-slate-100 transition"
    >
      {icon}
      {loading ? "Loading..." : children}
    </button>
  );
}