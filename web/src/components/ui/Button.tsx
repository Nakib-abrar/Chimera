import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

type Variant = "primary" | "secondary" | "tertiary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  pill?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  block,
  pill,
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        s.btn,
        s[`btn--${variant}`],
        size === "sm" && s["btn--sm"],
        size === "lg" && s["btn--lg"],
        block && s["btn--block"],
        pill && s["btn--pill"],
        className,
      )}
      {...rest}
    >
      {icon}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  children: ReactNode;
}

export function IconButton({ label, active, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(s.iconBtn, active && s["iconBtn--active"], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
