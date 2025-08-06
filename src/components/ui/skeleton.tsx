import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
};

export const TableSkeleton = () => {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-full" />
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: 10 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: 7 }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};
