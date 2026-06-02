import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer";
}

export function Skeleton({ className, variant = "shimmer" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        variant === "shimmer" ? "skeleton-shimmer" : "animate-pulse",
        className,
      )}
    />
  );
}
