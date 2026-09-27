import { useState } from "react";
import { Check, Circle, ShieldCheck, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { IntentType } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import { Button, CodeBlock, EmptyState, StatusChip, Switch, Tabs, useToast } from "@/components/ui";
import { approvalHistory } from "@/data/mock";
import s from "./offensive.module.css";

const INTENT_TONE: Record<IntentType, "warning" | "negative" | "neutral" | "accent"> = {
  RUN_EXPLOIT: "warning",
  WRITE_FILE: "accent",
  EGRESS_CALL: "accent",
  INSTALL_TOOL: "neutral",
  SPAWN_SUBAGENT: "neutral",
};

export function ApprovalQueue() {
  const { approvals, resolveApproval } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState("queue");
  const [always, setAlways] = useState<Set<string>>(new Set());

  const decide = (id: string, skill: string, decision: "approved" | "denied") => {
    resolveApproval(id);
    toast.push(`${decision === "approved" ? "Approved" : "Denied"}: ${skill}`, {
      tone: decision === "approved" ? "positive" : "warning",
    });
  };

  return (
    <Screen>
      <ScreenHeader
        title="Approval Queue"
        subtitle="Sensitive-intent actions land here before execution — whether from a direct tool call or from execute_code. The gate is identical."
        meta={approvals.length > 0 && <StatusChip tone="warning" dot>{approvals.length} pending</StatusChip>}
      />
      <Tabs
        tabs={[
          { value: "queue", label: "Pending", count: approvals.length },
          { value: "history", label: "History", count: approvalHistory.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "queue" ? (
        approvals.length === 0 ? (
          <EmptyState icon={<ShieldCheck />} title="Queue is clear" hint="No sensitive actions are waiting. Approvals appear here and inline in the chat rail." />
        ) : (
          <div className="col gap-lg">
            {approvals.map((a) => (
              <div key={a.id} className={s.approvalCard} data-loud={a.intent === "RUN_EXPLOIT"}>
                <div className="row between wrap gap-sm">
                  <div className="row gap-sm wrap">
                    <StatusChip tone={INTENT_TONE[a.intent]} dot>{a.intent}</StatusChip>
                    <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>{a.skill}</span>
                    <span className={s.originChip}>via {a.origin}</span>
                  </div>
                  <span className="t-caption">{a.createdAt}</span>
                </div>

                <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
                  <span className="t-caption t-mute">Target</span>
                  <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{a.target}</span>
                  <Circle size={8} style={{ fill: a.targetInScope ? "var(--scope-ok)" : "var(--scope-blocked)", color: a.targetInScope ? "var(--scope-ok)" : "var(--scope-blocked)" }} />
                  <span className="t-caption">{a.targetInScope ? "in scope" : "out of scope"}</span>
                  <span className="t-caption t-mute">· requested by {a.requestedBy}</span>
                </div>

                <CodeBlock code={a.command} label="exact command" />

                <div className="row between wrap gap-sm">
                  <label className="row gap-sm t-body-sm" style={{ cursor: "pointer" }}>
                    <Switch
                      on={always.has(a.id)}
                      onChange={() => {
                        const next = new Set(always);
                        next.has(a.id) ? next.delete(a.id) : next.add(a.id);
                        setAlways(next);
                      }}
                      label="Always allow this skill in this engagement"
                    />
                    <span className="col" style={{ gap: 0 }}>
                      Always allow this skill
                      <span className="t-caption">Scoped to this engagement only.</span>
                    </span>
                  </label>
                  <div className="row gap-sm">
                    <Button variant="danger" icon={<X size={15} />} onClick={() => decide(a.id, a.skill, "denied")}>Deny</Button>
                    <Button variant="primary" icon={<Check size={15} />} onClick={() => decide(a.id, a.skill, "approved")}>Approve</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="col gap-sm">
          {approvalHistory.map((h) => (
            <div key={h.id} className="row between" style={{ padding: "var(--space-md) var(--space-lg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)" }}>
              <div className="row gap-sm wrap">
                <StatusChip tone={INTENT_TONE[h.intent]}>{h.intent}</StatusChip>
                <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{h.skill}</span>
                <span className="t-caption t-mute">{h.target}</span>
              </div>
              <div className="row gap-sm">
                <StatusChip tone={h.decision === "approved" ? "positive" : "negative"}>{h.decision}</StatusChip>
                <span className="t-caption">{h.at}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
