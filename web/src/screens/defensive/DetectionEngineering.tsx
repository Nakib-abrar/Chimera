import { useState } from "react";
import { CheckCircle2, FlaskConical, Rocket, ShieldPlus } from "lucide-react";
import type { SigmaRule } from "@/lib/types";
import { Screen, ScreenHeader, Section } from "@/components/shell/Screen";
import { Button, Card, StatusChip, TtpChip, useToast } from "@/components/ui";
import { sigmaRules as seed } from "@/data/mock";
import s from "./defensive.module.css";

export function DetectionEngineering() {
  const toast = useToast();
  const [rules, setRules] = useState<SigmaRule[]>(seed);
  const [activeId, setActiveId] = useState(seed[0].id);
  const active = rules.find((r) => r.id === activeId) ?? rules[0];
  const [yaml, setYaml] = useState(active.yaml);

  const selectRule = (r: SigmaRule) => {
    setActiveId(r.id);
    setYaml(r.yaml);
  };

  const deploy = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, status: "deployed" } : r)));
    toast.push("Rule deployed to Wazuh.", { tone: "positive" });
  };

  return (
    <Screen>
      <ScreenHeader title="Detection Engineering" subtitle="Draft, lint, and test Sigma rules, then deploy them to Wazuh. Rules from confirmed offensive findings arrive in the draft queue." />

      <div className={s.detectSplit}>
        <Section title="Sigma rule editor" action={<StatusChip tone={active.status === "deployed" ? "positive" : "warning"} dot>{active.status}</StatusChip>}>
          <div className="col gap-md">
            <div className="row gap-sm">
              <TtpChip>{active.techniqueId}</TtpChip>
              <span className="t-body-sm-strong grow">{active.title}</span>
            </div>
            <div className={s.sigmaEditor}>
              <textarea className={s.sigmaTextarea} value={yaml} onChange={(e) => setYaml(e.target.value)} spellCheck={false} aria-label="Sigma rule YAML" />
            </div>
            <Card>
              <div className="row between" style={{ marginBottom: "var(--space-sm)" }}>
                <span className="row gap-sm t-body-sm-strong"><FlaskConical size={16} style={{ color: "var(--accent)" }} /> Test against historical logs</span>
                <StatusChip tone="positive"><CheckCircle2 size={13} /> valid syntax</StatusChip>
              </div>
              <p className="t-body-sm">
                <b style={{ color: "var(--ink)" }}>{active.testHits}</b> historical matches in the last 30 days. No parse errors.
              </p>
            </Card>
            <div className="row gap-sm">
              <Button variant="secondary" icon={<FlaskConical size={15} />}>Test rule</Button>
              <Button variant="primary" icon={<Rocket size={15} />} disabled={active.status === "deployed"} onClick={() => deploy(active.id)}>
                {active.status === "deployed" ? "Deployed to Wazuh" : "Deploy to Wazuh"}
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Draft queue" action={<StatusChip tone="accent" dot><ShieldPlus size={13} /> Purple-Team Bridge</StatusChip>}>
          <div className="col gap-md">
            {rules.map((r) => (
              <div key={r.id} className={s.draftCard} style={activeId === r.id ? { borderColor: "var(--accent)" } : undefined}>
                <div className="row between">
                  <TtpChip>{r.techniqueId}</TtpChip>
                  <StatusChip tone={r.status === "deployed" ? "positive" : r.status === "testing" ? "warning" : "neutral"}>{r.status}</StatusChip>
                </div>
                <span className="t-body-sm t-ink">{r.title}</span>
                {r.fromOffensive && <StatusChip tone="accent">from Offensive finding</StatusChip>}
                <button className="t-caption" style={{ color: "var(--accent)", textAlign: "left" }} onClick={() => selectRule(r)}>Review & edit</button>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </Screen>
  );
}
