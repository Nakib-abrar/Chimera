import type { ReactNode } from "react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

export interface TabDef {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: TabDef[];
  value: string;
  onChange: (v: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className={s.tabs} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          className={cx(s.tab, value === t.value && s["tab--active"])}
          onClick={() => onChange(t.value)}
          type="button"
        >
          {t.icon}
          {t.label}
          {t.count != null && <span className={s.tabCount}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
