import { useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardCopy, Download, FileCode2, FileText } from "lucide-react";
import type { Severity } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import { Button, SeverityPill, StatusChip, Textarea, useToast } from "@/components/ui";
import { findings } from "@/data/mock";
import { SEVERITY_ORDER, clickable } from "@/lib/ui";
import s from "./offensive.module.css";

const FORMATS = [
  { id: "pentest", name: "Pentest report", ext: "MD / PDF", available: true },
  { id: "h1", name: "HackerOne", ext: "MD", available: true },
  { id: "bugcrowd", name: "Bugcrowd", ext: "MD", available: true },
  { id: "ywh", name: "YesWeHack", ext: "MD", available: false },
];

const STEPS = ["Select findings", "Format", "Preview & edit", "Export"];

export function ReportStudio() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set(findings.filter((f) => f.status === "verified").map((f) => f.id)));
  const [format, setFormat] = useState("h1");

  const selectedFindings = findings.filter((f) => selected.has(f.id));
  const counts = SEVERITY_ORDER.reduce((acc, sev) => {
    acc[sev] = selectedFindings.filter((f) => f.severity === sev).length;
    return acc;
  }, {} as Record<Severity, number>);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const markdown = `# Security Assessment — acme-corp\n\n## Executive summary\n\nThis engagement identified ${selectedFindings.length} findings across the in-scope assets, including ${counts.critical} critical and ${counts.high} high-severity issues requiring prompt remediation.\n\n${selectedFindings
    .map(
      (f) => `## ${f.title}\n\n**Severity:** ${f.severity.toUpperCase()} · **CVSS:** ${f.cvss} · **${f.cwe}** · **${f.techniqueId}**\n\n**Affected asset:** \`${f.asset}\`\n\n${f.impact}\n\n**Evidence:** ${f.evidence.length} artifact(s), referenced by hash for integrity.`,
    )
    .join("\n\n")}`;

  return (
    <Screen>
      <ScreenHeader title="Report Studio" subtitle="Findings auto-populate from their schema, so the report is assembled — not written from scratch." />

      <div className={s.stepper}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "contents" }}>
            <div className={s.stepDot} data-active={i === step} data-done={i < step}>
              <span className={s.stepNum}>{i < step ? "✓" : i + 1}</span>
              {label}
            </div>
            {i < STEPS.length - 1 && <span className={s.stepLine} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="col gap-md">
          <div className="row gap-sm">
            <span className="t-body-sm-strong">{selectedFindings.length} selected</span>
            <SeverityPillRow counts={counts} />
          </div>
          <div className="col gap-sm">
            {findings.map((f) => (
              <label key={f.id} className="row gap-md" style={{ padding: "var(--space-md)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", cursor: "pointer" }}>
                <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggle(f.id)} />
                <SeverityPill severity={f.severity} />
                <span className="t-body-sm grow">{f.title}</span>
                <StatusChip tone={f.status === "verified" ? "positive" : "neutral"}>{f.status}</StatusChip>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={s.targetGrid}>
          {FORMATS.map((fmt) => (
            <div
              key={fmt.id}
              className={s.formatCard}
              data-selected={format === fmt.id}
              aria-pressed={format === fmt.id}
              aria-label={`${fmt.name} (${fmt.ext})`}
              style={{ opacity: fmt.available ? 1 : 0.6 }}
              {...(fmt.available ? clickable(() => setFormat(fmt.id)) : { "aria-disabled": true })}
            >
              <div className="row between">
                <FileText size={18} style={{ color: "var(--accent)" }} />
                {format === fmt.id && <StatusChip tone="accent" dot>Selected</StatusChip>}
              </div>
              <div className="t-body-md-strong" style={{ marginTop: "var(--space-sm)" }}>{fmt.name}</div>
              <div className="t-caption">{fmt.ext}</div>
              {!fmt.available && <div className="t-caption" style={{ color: "var(--accent)", marginTop: "var(--space-sm)" }}>Import the report-yeswehack skill</div>}
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className={s.reportSplit}>
          <div className="col gap-sm">
            <span className="t-caption-caps">Editable source</span>
            <Textarea mono defaultValue={markdown} style={{ minHeight: 420, fontSize: "var(--fs-mono-sm)" }} />
          </div>
          <div className="col gap-sm">
            <span className="t-caption-caps">Live preview</span>
            <div className={s.reportPreview}>
              <h1>Security Assessment — acme-corp</h1>
              <h2>Executive summary</h2>
              <p>This engagement identified {selectedFindings.length} findings across the in-scope assets, including {counts.critical} critical and {counts.high} high-severity issues.</p>
              {selectedFindings.map((f) => (
                <div key={f.id}>
                  <h2>{f.title}</h2>
                  <div className="row gap-sm" style={{ margin: "var(--space-xs) 0" }}>
                    <SeverityPill severity={f.severity} />
                    <StatusChip tone="neutral">CVSS {f.cvss}</StatusChip>
                    <StatusChip tone="neutral">{f.techniqueId}</StatusChip>
                  </div>
                  <p>{f.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="col gap-lg">
          <div className="col gap-sm" style={{ maxWidth: 480 }}>
            <span className="t-body-md-strong">Export {FORMATS.find((f) => f.id === format)?.name}</span>
            <p className="t-caption">Evidence is referenced by hash for integrity.</p>
          </div>
          <div className="row gap-sm wrap">
            <Button variant="primary" icon={<Download size={15} />} onClick={() => toast.push("PDF exported.", { tone: "positive" })}>Export PDF</Button>
            <Button variant="secondary" icon={<FileCode2 size={15} />} onClick={() => toast.push("Markdown exported.", { tone: "positive" })}>Export Markdown</Button>
            <Button variant="tertiary" icon={<ClipboardCopy size={15} />} onClick={() => toast.push("Copied to clipboard.", { tone: "info" })}>Copy to clipboard</Button>
          </div>
        </div>
      )}

      <div className="row between" style={{ marginTop: "var(--space-md)" }}>
        <Button variant="tertiary" icon={<ArrowLeft size={15} />} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < STEPS.length - 1 && (
          <Button variant="primary" iconRight={<ArrowRight size={15} />} onClick={() => setStep((s) => s + 1)}>
            {step === 0 ? "Choose format" : step === 1 ? "Preview" : "Export"}
          </Button>
        )}
      </div>
    </Screen>
  );
}

function SeverityPillRow({ counts }: { counts: Record<Severity, number> }) {
  return (
    <div className="row gap-xs">
      {SEVERITY_ORDER.filter((s) => counts[s] > 0).map((s) => (
        <StatusChip key={s} tone="neutral">
          <SeverityPill severity={s} /> {counts[s]}
        </StatusChip>
      ))}
    </div>
  );
}
