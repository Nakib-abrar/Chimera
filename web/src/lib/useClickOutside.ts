import { useEffect, useRef } from "react";

/** Calls handler when a pointerdown lands outside the returned ref element. */
export function useClickOutside<T extends HTMLElement>(
  active: boolean,
  handler: () => void,
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, handler]);
  return ref;
}
