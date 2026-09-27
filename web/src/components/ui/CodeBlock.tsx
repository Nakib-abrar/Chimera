import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import s from "./ui.module.css";

interface CodeBlockProps {
  code: string;
  label?: ReactNode;
  copyable?: boolean;
}

export function CodeBlock({ code, label, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — no-op */
    }
  };
  return (
    <div className={s.code}>
      {(label || copyable) && (
        <div className={s.codeHead}>
          <span className="t-caption t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>
            {label}
          </span>
          {copyable && (
            <button className={s.copyBtn} onClick={copy} type="button">
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      <pre className={s.codePre}>{code}</pre>
    </div>
  );
}
