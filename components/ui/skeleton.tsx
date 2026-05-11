import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-md bg-border", className)}
  />
);

export default Skeleton;
