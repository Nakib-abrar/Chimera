import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, AlertTriangle, Undo2 } from "lucide-react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

type Tone = "positive" | "info" | "warning";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  undo?: () => void;
}

interface ToastApi {
  push: (message: string, opts?: { tone?: Tone; undo?: () => void }) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

const ICON: Record<Tone, ReactNode> = {
  positive: <CheckCircle2 style={{ color: "var(--positive)" }} />,
  info: <Info style={{ color: "var(--accent)" }} />,
  warning: <AlertTriangle style={{ color: "var(--warning)" }} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<ToastApi["push"]>(
    (message, opts) => {
      const id = ++idRef.current;
      const tone = opts?.tone ?? "info";
      setItems((prev) => [...prev, { id, message, tone, undo: opts?.undo }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {createPortal(
        <div className={s.toastStack} aria-live="polite">
          {items.map((t) => (
            <div key={t.id} className={s.toast} role="status">
              <span className={cx(s.toastIcon)}>{ICON[t.tone]}</span>
              <span className="t-body-sm t-ink grow">{t.message}</span>
              {t.undo && (
                <button
                  className={s.copyBtn}
                  onClick={() => {
                    t.undo?.();
                    remove(t.id);
                  }}
                >
                  <Undo2 /> Undo
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) return { push: () => undefined };
  return ctx;
}
