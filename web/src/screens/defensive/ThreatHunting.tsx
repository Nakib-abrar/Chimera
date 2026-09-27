import { useState } from "react";
import { ArrowRight, Play, Search } from "lucide-react";
import type { Hypothesis } from "@/lib/types";
import { Screen, ScreenHeader, Section } from "@/components/shell/Screen";
import { Button, Card, CodeBlock, StatusChip } from "@/components/ui";
import { hypotheses as seed } from "@/data/mock";
import s from "./defensive.module.css";

const COLUMNS: { key: Hypothesis["column"]; label: string; tone: "neutral" | "warning" | "positive" | "negative" }[] = [
  { key: "hypothesis", label: "Hypothesis", tone: "neutral" },
  { key: "investigating", label: "Investigating", tone: "warning" },
  { key: "confirmed", label: "Confirmed", tone: "positive" },
  { key: "ruled-out", label: "Ruled out", tone: "negative" },
];

const ORDER: Hypothesis["column"][] = ["hypothesis", "investigating", "confirmed", "ruled-out"];

const SAVED_QUERIES = [
  "index=auth failed_login | stats count by src_ip",
  "process=powershell.exe AND cmd=*EncodedCommand*",
  "smb_session dst=dc01 | rare user",
];

export function ThreatHunting() {
  const [items, setItems] = useState<Hypothesis[]>(seed);
  const [query, setQuery] = useState(SAVED_QUERIES[0]);

  const advance = (id: string) => {
    setItems((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const idx = ORDER.indexOf(h.column);
        return idx < ORDER.length - 1 ? { ...h, column: ORDER[idx + 1] } : h;
      }),
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Threat Hunting" subtitle="Chat-driven hunting with a hypothesis board. Drive the hunt from the chat rail; track it here." />

      <Section title="Hypothesis board">
        <div className={s.board}>
          {COLUMNS.map((col) => {
            const cards = items.filter((h) => h.column === col.key);
            return (
              <div key={col.key} className={s.boardCol}>
                <div className={s.boardColHead}>
                  <StatusChip tone={col.tone} dot>{col.label}</StatusChip>
                  <span className="t-caption">{cards.length}</span>
                </div>
                {cards.map((h) => (
                  <div key={h.id} className={s.hypCard}>
                    <p className="t-body-sm t-ink" style={{ marginBottom: "var(--space-xs)" }}>{h.text}</p>
                    <p className="t-caption">{h.evidence}</p>
                    {h.column !== "confirmed" && h.column !== "ruled-out" && (
                      <button className="t-caption row gap-xs" style={{ color: "var(--accent)", marginTop: "var(--space-sm)" }} onClick={() => advance(h.id)}>
                        Advance <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Section>

      <div className="col gap-md">
        <div className="row between">
          <h2 className="t-heading-md">Query</h2>
          <Button size="sm" variant="primary" icon={<Play size={14} />}>Run query</Button>
        </div>
        <div className="row gap-sm wrap">
          {SAVED_QUERIES.map((q) => (
            <button key={q} className="t-caption row gap-xs" style={{ padding: "4px 10px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border)", background: query === q ? "var(--surface-raised)" : "var(--surface)", color: query === q ? "var(--ink)" : "var(--body)" }} onClick={() => setQuery(q)}>
              <Search size={12} /> saved
            </button>
          ))}
        </div>
        <CodeBlock code={query} label="query" />
        <Card flush>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["time", "src_ip", "user", "count"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "var(--space-sm) var(--space-lg)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)", color: "var(--mute)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["09:42:11", "198.51.100.23", "svc_backup", "15"],
                ["09:12:02", "198.51.100.23", "admin", "9"],
                ["08:59:44", "203.0.113.7", "j.doe", "3"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((c, i) => (
                    <td key={i} style={{ padding: "var(--space-sm) var(--space-lg)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)", color: "var(--body)" }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Screen>
  );
}
