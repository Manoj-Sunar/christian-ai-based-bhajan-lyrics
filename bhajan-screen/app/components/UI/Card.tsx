import { cardStyles } from "@/app/constants/ui";
import { cn } from "@/app/lib/utils";


interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(cardStyles, className)}>
      {children}
    </div>
  );
}