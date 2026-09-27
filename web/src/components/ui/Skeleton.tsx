import { cx } from "@/lib/ui";
import s from "./ui.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

/** Loading placeholder — skeletons, not spinners (9.4). */
export function Skeleton({ width = "100%", height = 16, radius, className }: SkeletonProps) {
  return (
    <span
      className={cx(s.skeleton, className)}
      style={{ display: "block", width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="col gap-md" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={44} radius="var(--radius-sm)" />
      ))}
    </div>
  );
}
