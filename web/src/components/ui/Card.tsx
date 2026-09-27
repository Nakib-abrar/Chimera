import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  flush?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ raised, flush, interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        s.card,
        raised && s["card--raised"],
        flush && s["card--flush"],
        interactive && s["card--interactive"],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
