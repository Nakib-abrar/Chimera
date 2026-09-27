import { useEffect, useState } from "react";
import { Check, Github, Loader2, Sparkles, Upload, Waypoints } from "lucide-react";
import { Button, Field, Modal, SegmentedControl, StatusChip, TextInput, useToast } from "@/components/ui";
import s from "@/screens/offensive/offensive.module.css";

type Source = "local" | "skillssh" | "github";

export function SkillImportWizard({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: "offensive" | "defensive";
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<Source>("skillssh");

  useEffect(() => {
    if (!open) {
      setStep(0);
      setSource("skillssh");
    }
  }, [open]);

  // Auto-advance the fetch/parse step
  useEffect(() => {
    if (step === 1) {
      const t = window.setTimeout(() => setStep(2), 1300);
      return () => window.clearTimeout(t);
    }
  }, [step]);

  const footer =
    step === 1 ? null : (
      <>
        {step > 0 && step !== 1 && <Button variant="tertiary" onClick={() => setStep((v) => Math.max(0, v - 1))}>Back</Button>}
        {step === 0 && <Button variant="primary" onClick={() => setStep(1)}>Fetch & parse</Button>}
        {step === 2 && <Button variant="primary" onClick={() => setStep(3)}>Confirm import</Button>}
        {step === 3 && (
          <Button
            variant="primary"
            icon={<Check size={15} />}
            onClick={() => {
              toast.push("Skill imported and hot-loaded.", { tone: "positive" });
              onClose();
            }}
          >
            Write & hot-load
          </Button>
        )}
      </>
    );

  return (
    <Modal open={open} onClose={onClose} title="Import skill" footer={footer}>
      {/* step rail */}
      <div className="row gap-sm" style={{ marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
        {["Source", "Fetch & parse", "Review metadata", "Confirm"].map((label, i) => (
          <StatusChip key={label} tone={i === step ? "accent" : i < step ? "positive" : "neutral"} dot={i <= step}>
            {i + 1}. {label}
          </StatusChip>
        ))}
      </div>

      {step === 0 && (
        <div className="col gap-lg">
          <SegmentedControl<Source>
            block
            segments={[
              { value: "local", label: "Local upload", icon: <Upload size={15} /> },
              { value: "skillssh", label: "skills.sh", icon: <Sparkles size={15} /> },
              { value: "github", label: "GitHub", icon: <Github size={15} /> },
            ]}
            value={source}
            onChange={setSource}
          />
          {source === "local" && (
            <div style={{ border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-2xl)", textAlign: "center" }}>
              <Upload size={28} style={{ color: "var(--mute)", margin: "0 auto var(--space-sm)" }} />
              <div className="t-body-sm">Drop a SKILL.md, folder, or .zip here</div>
              <div className="t-caption">or click to browse</div>
            </div>
          )}
          {source === "skillssh" && <Field label="Skill name or owner/repo" help="Pulled from the skills.sh registry."><TextInput mono placeholder="owner/recon-graphql" /></Field>}
          {source === "github" && <Field label="Repository URL or owner/repo[/path]"><TextInput mono placeholder="https://github.com/owner/repo/tree/main/skills/xss" /></Field>}
        </div>
      )}

      {step === 1 && (
        <div className="col center gap-md" style={{ padding: "var(--space-2xl) 0" }}>
          <Loader2 size={32} style={{ color: "var(--accent)", animation: "chimera-spin 0.8s linear infinite" }} />
          <div className="t-body-sm">The Skill Import Agent is pulling and parsing frontmatter…</div>
        </div>
      )}

      {step === 2 && (
        <div className="col gap-lg">
          <div className={s.approvalCard} style={{ borderLeft: "3px solid var(--warning)", padding: "var(--space-md)" }}>
            <span className="t-caption" style={{ color: "var(--warning)" }}>
              Review before this goes live — sensitivity and tool-dependency fields control the safety engines.
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-lg)" }}>
            <Field label="Name"><TextInput mono defaultValue="graphql-introspect" /></Field>
            <Field label={`Platforms`}><TextInput defaultValue={platform} /></Field>
            <AiField label="Tactic" value="Reconnaissance" />
            <AiField label="Technique / ID" value="Active Scanning · T1595" />
            <AiField label="Tool dependencies" value="httpx, custom" />
            <AiField label="Sensitive intents" value="EGRESS_CALL" highlight />
          </div>
          <Field label="Install recipe">
            <TextInput mono defaultValue="pip install gql && chmod +x introspect.py" />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="col gap-md">
          <p className="t-body-sm">
            This writes into <code className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>skills/{platform}/graphql-introspect/</code> and hot-loads it. Never a silent auto-import — this confirm step is mandatory.
          </p>
          <div className="col gap-sm">
            <div className="row gap-sm t-body-sm"><Check size={15} style={{ color: "var(--positive)" }} /> Frontmatter schema validated</div>
            <div className="row gap-sm t-body-sm"><Check size={15} style={{ color: "var(--positive)" }} /> Tool dependencies resolvable</div>
            <div className="row gap-sm t-body-sm"><Check size={15} style={{ color: "var(--positive)" }} /> Sensitivity registered with Guardrail engine</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AiField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="col gap-xs">
      <span className="row gap-xs t-caption" style={{ fontWeight: 600 }}>
        {label}
        <StatusChip tone="accent"><Waypoints size={11} /> AI-suggested</StatusChip>
      </span>
      <TextInput defaultValue={value} style={highlight ? { borderColor: "var(--warning)" } : undefined} />
    </div>
  );
}
