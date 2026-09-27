import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, FolderOpen, FolderPlus, Server, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Engagement } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import {
  Button,
  DataTable,
  Field,
  Modal,
  SegmentedControl,
  Select,
  SeverityMiniBar,
  StatusChip,
  TextInput,
  Textarea,
  useToast,
  type Column,
} from "@/components/ui";
import { engagements, scopeEntries } from "@/data/mock";
import { totalFindings } from "@/lib/ui";
import s from "./offensive.module.css";

const STATUS_TONE = { active: "positive", paused: "neutral", reporting: "warning", closed: "neutral" } as const;
type ScopeMode = "manual" | "import" | "paste";

interface StagedEntry {
  id: string;
  pattern: string;
  kind: string;
  inScope: boolean;
  source: string;
  checked: boolean;
}

const STAGED: StagedEntry[] = [
  { id: "1", pattern: "*.acme-corp.com", kind: "wildcard", inScope: true, source: "AI-extracted", checked: true },
  { id: "2", pattern: "api.acme-corp.com", kind: "domain", inScope: true, source: "AI-extracted", checked: true },
  { id: "3", pattern: "203.0.113.0/24", kind: "ip", inScope: true, source: "AI-extracted", checked: true },
  { id: "4", pattern: "blog.acme-corp.com", kind: "domain", inScope: false, source: "AI-extracted", checked: true },
];

export function EngagementLauncher() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setActiveEngagementId } = useApp();
  const [newOpen, setNewOpen] = useState(false);
  const [openExisting, setOpenExisting] = useState(false);
  const [step, setStep] = useState(0);
  const [scopeMode, setScopeMode] = useState<ScopeMode>("manual");
  const [execMode] = useState<"local" | "docker">("docker");
  const [staged, setStaged] = useState<StagedEntry[]>(STAGED);

  const columns: Column<Engagement>[] = [
    { key: "name", header: "Name", render: (e) => <span className="t-body-md-strong">{e.name}</span>, sortValue: (e) => e.name },
    { key: "type", header: "Type", hideBelow: "mobile", render: (e) => <StatusChip tone="neutral">{e.type}</StatusChip> },
    { key: "scope", header: "Scope", hideBelow: "tablet", render: (e) => <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{e.scopeCount}</span>, sortValue: (e) => e.scopeCount },
    { key: "findings", header: "Findings", render: (e) => <SeverityMiniBar counts={e.findingCounts} />, sortValue: (e) => totalFindings(e.findingCounts) },
    { key: "status", header: "Status", render: (e) => <StatusChip tone={STATUS_TONE[e.status]} dot>{e.status}</StatusChip> },
    { key: "last", header: "Last active", hideBelow: "tablet", render: (e) => <span className="t-caption">{e.lastActive}</span> },
  ];

  const openEngagement = (e: Engagement) => {
    setActiveEngagementId(e.id);
    navigate("/offensive/console");
  };

  const finishNew = () => {
    toast.push("Engagement created. Scope committed to the Scope Engine.", { tone: "positive" });
    setNewOpen(false);
    setStep(0);
    navigate("/offensive/console");
  };

  return (
    <Screen>
      <ScreenHeader
        title="Engagements"
        subtitle="Launch a new engagement or reopen an existing workspace."
        actions={
          <>
            <Button variant="secondary" icon={<FolderOpen size={15} />} onClick={() => setOpenExisting(true)}>Open existing</Button>
            <Button variant="primary" icon={<FolderPlus size={15} />} onClick={() => { setNewOpen(true); setStep(0); }}>New engagement</Button>
          </>
        }
      />

      <DataTable columns={columns} rows={engagements} rowKey={(e) => e.id} onRowClick={openEngagement} defaultSort={{ key: "findings", dir: "desc" }} />

      {/* ---- New engagement stepper ---- */}
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        wide
        title="New engagement"
        footer={
          <>
            {step > 0 && <Button variant="tertiary" onClick={() => setStep((v) => v - 1)}>Back</Button>}
            {step < 2 ? (
              <Button variant="primary" onClick={() => setStep((v) => v + 1)}>Next</Button>
            ) : (
              <Button variant="primary" icon={<Check size={15} />} onClick={finishNew}>Create engagement</Button>
            )}
          </>
        }
      >
        <div style={{ display: "flex", gap: "var(--space-xl)" }}>
          <div className={s.stepRail}>
            {["Name & type", "Workspace", "Scope"].map((label, i) => (
              <div key={label} className={s.stepRailItem} data-active={i === step}>
                <span className={s.stepNum} style={i < step ? { background: "var(--positive)", borderColor: "var(--positive)", color: "var(--on-accent)" } : i === step ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--on-accent)" } : undefined}>
                  {i < step ? "✓" : i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="grow col gap-lg">
            {step === 0 && (
              <>
                <Field label="Engagement name"><TextInput placeholder="acme-corp" autoFocus /></Field>
                <Field label="Type">
                  <Select options={[{ value: "bug-bounty", label: "Bug bounty" }, { value: "pentest", label: "Pentest" }]} />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field
                  label="Workspace directory"
                  help={execMode === "docker" ? "Browsing within /workspace — configured mount root. The app cannot mount arbitrary host paths." : "Local mode — any folder."}
                >
                  <div className="row gap-sm">
                    <TextInput mono defaultValue="/workspace/acme-corp" readOnly={execMode === "docker"} />
                    <Button variant="secondary" icon={<FolderOpen size={15} />}>Browse</Button>
                  </div>
                </Field>
                {execMode === "docker" && (
                  <div className="row gap-sm t-caption" style={{ color: "var(--positive)" }}>
                    <ShieldCheck size={14} /> Docker mode restricts the picker to declared mount roots.
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <SegmentedControl<ScopeMode>
                  block
                  segments={[
                    { value: "manual", label: "Manual" },
                    { value: "import", label: "Platform import" },
                    { value: "paste", label: "Smart Paste" },
                  ]}
                  value={scopeMode}
                  onChange={setScopeMode}
                />

                {scopeMode === "manual" && (
                  <div className={s.scopeSplit}>
                    <Field label="scope.yaml">
                      <Textarea mono defaultValue={`in_scope:\n  - "*.acme-corp.com"\n  - api.acme-corp.com\n  - 203.0.113.0/24\nout_of_scope:\n  - blog.acme-corp.com`} style={{ minHeight: 220 }} />
                    </Field>
                    <div className="col gap-xs">
                      <span className="t-caption" style={{ fontWeight: 600 }}>Parsed entries</span>
                      {scopeEntries.map((e) => (
                        <span key={e.id} className={s.scopeChip}>
                          <span className="row gap-xs">
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: e.inScope ? "var(--scope-ok)" : "var(--scope-blocked)" }} />
                            {e.pattern}
                          </span>
                          <StatusChip tone="neutral">{e.kind}</StatusChip>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {scopeMode === "import" && <Field label="Program URL" help="Paste a HackerOne / Bugcrowd / YesWeHack program URL."><TextInput mono placeholder="https://hackerone.com/acme-corp" /></Field>}
                {scopeMode === "paste" && <Field label="Paste the program's scope page" help="An AI parsing skill extracts entries + metadata."><Textarea placeholder="Paste scope text here…" style={{ minHeight: 120 }} /></Field>}

                {(scopeMode === "import" || scopeMode === "paste") && (
                  <div className="col gap-sm">
                    <div className={s.approvalCard} style={{ borderLeft: "3px solid var(--warning)", padding: "var(--space-sm) var(--space-md)" }}>
                      <span className="t-caption" style={{ color: "var(--warning)" }}>Review before committing — nothing is written to scope.yaml until you confirm.</span>
                    </div>
                    <div className="col gap-xs">
                      {staged.map((row) => (
                        <label key={row.id} className="row gap-sm" style={{ padding: "var(--space-sm) var(--space-md)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)" }}>
                          <input type="checkbox" checked={row.checked} onChange={() => setStaged((prev) => prev.map((r) => (r.id === row.id ? { ...r, checked: !r.checked } : r)))} />
                          <span className="t-mono-sm grow" style={{ fontFamily: "var(--font-mono)" }}>{row.pattern}</span>
                          <StatusChip tone="neutral">{row.kind}</StatusChip>
                          <StatusChip tone={row.inScope ? "positive" : "negative"}>{row.inScope ? "in-scope" : "out-of-scope"}</StatusChip>
                          <StatusChip tone="accent">{row.source}</StatusChip>
                        </label>
                      ))}
                    </div>
                    <span className="t-caption">Enforced by the Scope Engine on every tool call.</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* ---- Open existing ---- */}
      <Modal
        open={openExisting}
        onClose={() => setOpenExisting(false)}
        title="Open existing engagement"
        footer={<Button variant="primary" onClick={() => { setOpenExisting(false); navigate("/offensive/console"); }}>Open</Button>}
      >
        <div className="col gap-lg">
          <Field label="Select a folder">
            <div className="row gap-sm">
              <TextInput mono defaultValue="/workspace/northwind" />
              <Button variant="secondary" icon={<FolderOpen size={15} />}>Browse</Button>
            </div>
          </Field>
          <div className="col gap-sm">
            <div className="row gap-sm t-body-sm"><Check size={15} style={{ color: "var(--positive)" }} /> Found <code className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>scope.yaml</code></div>
            <div className="row gap-sm t-body-sm" style={{ color: "var(--warning)" }}>
              <Server size={15} /> No <code className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>.chimera.md</code> found in this folder.
            </div>
            <Button variant="secondary" size="sm">Initialize missing file</Button>
          </div>
        </div>
      </Modal>
    </Screen>
  );
}
