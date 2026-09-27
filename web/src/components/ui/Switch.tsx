import { cx } from "@/lib/ui";
import s from "./ui.module.css";

interface SwitchProps {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Switch({ on, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cx(s.switch, on && s["switch--on"])}
      onClick={() => onChange(!on)}
    >
      <span className={s.switchKnob} />
    </button>
  );
}
