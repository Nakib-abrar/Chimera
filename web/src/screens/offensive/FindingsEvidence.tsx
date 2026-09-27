import { useState } from "react";
import {
  ChevronDown,
  Copy,
  FileImage,
  FileText,
  ListChecks,
  RefreshCw,
  ScrollText,
  ShieldX,
  TerminalSquare,
} from "lucide-react";
import type { EvidenceItem, Finding, Severity } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import {
  Button,
  Drawer,
  Field,
  Modal,
  SeverityIcon,
  SeverityPill,
  StatusChip,
  TextInput,
  Textarea,
  TtpChip,
  useToast,
} from "@/components/ui";
import { SEVERITY_META, SEVERITY_ORDER, clickable, cx } from "@/lib/ui";
import { findings } from "@/data/mock";
import s from "./offensive.module.css";

const STATUS_TONE = {
  new: "neutral",
  verifying: "warning",
  verified: "positive",
  reported: "accent",
  dismissed: "neutral",
} as const;

function evidenceIcon(kind: EvidenceItem["kind"]) {
  if (kind === "screenshot") return <FileImage size={16} />;
  if (kind === "log") return <TerminalSquare size={16} />;
  if (kind === "poc") return <FileText size={16} />;
  return <ScrollText size={16} />;
}

export function FindingsView({ embedded }: { embedded?: boolean }) {
  const toast = useToast();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["f1"]));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<Severity>>(new Set(["info"]));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Finding | null>(null);
  const [rejectionsOpen, setRejectionsOpen] = useState(false);

  const grouped = SEVERITY_ORDER.map((sev) => ({
    sev,
    items: findings.filter((f) => f.severity === sev),
  })).filter((g) => g.items.length > 0);

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const content = (
    <>
      {grouped.map(({ sev, items }) => {
        const meta = SEVERITY_META[sev];
        const groupCollapsed = collapsedGroups.has(sev);
        return (
          <div key={sev} className={s.sevGroup}>
            <div
              className={s.sevGroupHead}
              style={{ ["--sev" as string]: meta.token }}
              aria-expanded={!groupCollapsed}
              {...clickable(() => {
                const next = new Set(collapsedGroups);
                next.has(sev) ? next.delete(sev) : next.add(sev);
                setCollapsedGroups(next);
              })}
            >
              <ChevronDown size={16} style={{ transform: groupCollapsed ? "rotate(-90deg)" : "none", transition: "transform 120ms", color: "var(--mute)" }} />
              <SeverityIcon severity={sev} size={13} />
              <span className="t-body-md-strong">{meta.label}</span>
              <StatusChip tone="neutral">{items.length}</StatusChip>
            </div>
            {!groupCollapsed &&
              items.map((f) => {
                const open = expanded.has(f.id);
                return (
                  <div key={f.id}>
                    <div className={s.findingRow}>
                      <input
                        type="checkbox"
                        checked={selected.has(f.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggle(selected, f.id, setSelected)}
                        aria-label={`Select ${f.title}`}
                      />
                      <span
                        {...clickable(() => toggle(expanded, f.id, setExpanded))}
                        style={{ cursor: "pointer" }}
                        aria-label={open ? "Collapse evidence" : "Expand evidence"}
                        aria-expanded={open}
                      >
                        <SeverityPill severity={f.severity} />
                      </span>
                      <button className="t-body-sm-strong grow" style={{ textAlign: "left" }} onClick={() => setDetail(f)}>
                        {f.title}
                      </button>
                      <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--mute)" }}>{f.asset}</span>
                      <TtpChip>{f.techniqueId}</TtpChip>
                      <StatusChip tone={STATUS_TONE[f.status]}>{f.status}</StatusChip>
                      <Button
                        size="sm"
                        variant="tertiary"
                        icon={<RefreshCw size={14} />}
                        onClick={() => toast.push(`Verifying "${f.title}" — re-running verification skills.`, { tone: "info" })}
                      >
                        Verify
                      </Button>
                    </div>
                    {open && (
                      <div style={{ padding: "0 var(--space-lg) var(--space-lg) 56px", borderTop: "1px solid var(--border)" }}>
                        <div className="t-caption-caps" style={{ margin: "var(--space-md) 0 var(--space-sm)" }}>
                          Evidence bundle — hashed & timestamped
                        </div>
                        {f.evidence.length > 0 ? (
                          <div className={s.evidenceGrid}>
                            {f.evidence.map((e) => (
                              <div key={e.id} className={s.evidenceTile}>
                                <span className={s.evidenceIcon}>{evidenceIcon(e.kind)}</span>
                                <div className="col" style={{ gap: 2, minWidth: 0 }}>
                                  <span className="t-body-sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label}</span>
                                  <span className="t-caption" style={{ fontFamily: "var(--font-mono)" }}>{e.hash}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="t-body-sm t-mute">No evidence captured yet. Verify to collect request/response, screenshots, and logs.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </>
  );

  const header = (
    <ScreenHeader
      title="Findings & Evidence"
      subtitle="Grouped by severity, each verifiable in a click. Every finding maps 1:1 to the report schema."
      actions={
        <>
          <Button
            variant="secondary"
            icon={<ListChecks size={15} />}
            disabled={selected.size === 0}
            onClick={() => toast.push(`${selected.size} findings added to Report Studio.`, { tone: "positive" })}
          >
            Add {selected.size || ""} to report
          </Button>
          <button className="t-caption row gap-xs" style={{ color: "var(--mute)" }} onClick={() => setRejectionsOpen(true)}>
            <ShieldX size={13} /> 12 out-of-scope attempts blocked
          </button>
        </>
      }
    />
  );

  const rejectionsModal = (
    <Modal open={rejectionsOpen} onClose={() => setRejectionsOpen(false)} title="Scope rejection log">
      <p className="t-body-sm t-mute" style={{ marginBottom: "var(--space-md)" }}>
        The Scope Engine blocked these out-of-scope tool calls. This is the guardrail working.
      </p>
      <div className="col gap-sm">
        {[
          { t: "14:22", target: "blog.acme-corp.com", skill: "nuclei-verify" },
          { t: "13:50", target: "*.internal.acme-corp.com", skill: "subdomain-enum" },
          { t: "12:31", target: "198.51.100.7", skill: "nmap-scan" },
        ].map((r) => (
          <div key={r.t} className="row gap-sm" style={{ justifyContent: "space-between", padding: "var(--space-sm) var(--space-md)", background: "var(--surface-inset)", borderRadius: "var(--radius-sm)" }}>
            <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{r.target}</span>
            <span className="t-caption">{r.skill} · {r.t}</span>
          </div>
        ))}
      </div>
    </Modal>
  );

  const detailSheet = (
    <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title} subtitle="Editable — these fields feed the report directly">
      {detail && (
        <>
          <div className="row gap-sm wrap">
            <SeverityPill severity={detail.severity} />
            <TtpChip>{detail.techniqueId} · {detail.technique}</TtpChip>
            <StatusChip tone="neutral">{detail.cwe}</StatusChip>
            <StatusChip tone="warning">CVSS {detail.cvss.toFixed(1)}</StatusChip>
          </div>
          <Field label="Affected asset"><TextInput mono defaultValue={detail.asset} /></Field>
          <Field label="Impact"><Textarea defaultValue={detail.impact} /></Field>
          <div className="col gap-xs">
            <span className="t-caption" style={{ fontWeight: 600 }}>Steps to reproduce</span>
            {detail.steps.map((step, i) => (
              <div key={i} className="row gap-sm" style={{ alignItems: "flex-start" }}>
                <span className="t-caption-caps" style={{ marginTop: 3 }}>{i + 1}</span>
                <code className="t-mono-sm" style={{ fontFamily: "var(--font-mono)", background: "var(--surface-inset)", padding: "4px 8px", borderRadius: "var(--radius-sm)", flex: 1, wordBreak: "break-all" }}>{step}</code>
              </div>
            ))}
          </div>
          <Field label="Suggested fix"><Textarea defaultValue={detail.suggestedFix} /></Field>
          <div className="col gap-sm">
            <span className="t-caption" style={{ fontWeight: 600 }}>Evidence</span>
            {detail.evidence.map((e) => (
              <div key={e.id} className={s.evidenceTile}>
                <span className={s.evidenceIcon}>{evidenceIcon(e.kind)}</span>
                <div className="col grow" style={{ gap: 2, minWidth: 0 }}>
                  <span className="t-body-sm">{e.label}</span>
                  <span className="t-caption" style={{ fontFamily: "var(--font-mono)" }}>{e.hash} · {e.timestamp}</span>
                </div>
                <button className="t-caption row gap-xs" onClick={() => toast.push("Hash copied.", { tone: "info" })}><Copy size={13} /></button>
              </div>
            ))}
          </div>
          <div className="row gap-sm">
            <Button variant="primary" icon={<RefreshCw size={15} />} onClick={() => toast.push("Re-verifying finding…", { tone: "info" })}>Verify</Button>
            <Button variant="secondary" onClick={() => toast.push("Added to report.", { tone: "positive" })}>Add to report</Button>
          </div>
        </>
      )}
    </Drawer>
  );

  if (embedded) {
    return (
      <div className={cx()}>
        <div style={{ marginBottom: "var(--space-md)" }}>{header}</div>
        {content}
        {detailSheet}
        {rejectionsModal}
      </div>
    );
  }

  return (
    <Screen>
      {header}
      <div>{content}</div>
      {detailSheet}
      {rejectionsModal}
    </Screen>
  );
}

export function FindingsEvidence() {
  return <FindingsView />;
}
