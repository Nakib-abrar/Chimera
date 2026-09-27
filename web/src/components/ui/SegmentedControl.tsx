import type { ReactNode } from "react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
  block?: boolean;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  block,
  ariaLabel,
}: Props<T>) {
  return (
    <div
      className={cx(s.segmented, block && s["segmented--block"])}
      role="tablist"
      aria-label={ariaLabel}
    >
      {segments.map((seg) => (
        <button
          key={seg.value}
          role="tab"
          aria-selected={value === seg.value}
          className={cx(s.segment, value === seg.value && s["segment--active"])}
          onClick={() => onChange(seg.value)}
          type="button"
        >
          {seg.icon}
          {seg.label}
        </button>
      ))}
    </div>
  );
}
