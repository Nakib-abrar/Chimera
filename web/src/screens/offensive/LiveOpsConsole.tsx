import { useState } from "react";
import { Check, ChevronRight, GripVertical, Play, Terminal } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { clickable } from "@/lib/ui";
import { CodeBlock, Sparkline, StatusChip, Tabs, agentStatusLabel, useToast } from "@/components/ui";
import { StatusDot } from "@/components/ui";
import { chatSeed, orchestratorTree, planTasks } from "@/data/mock";
import { TargetOverviewView } from "./TargetOverview";
import { ThreatMapView } from "./ThreatMap";
import { FindingsView } from "./FindingsEvidence";
import s from "./offensive.module.css";
import screen from "@/components/shell/screen.module.css";

const TASK_TONE = { todo: "neutral", running: "warning", done: "positive", blocked: "negative" } as const;

export function LiveOpsConsole() {
  const toast = useToast();
  const { setRailView } = useApp();
  const [tab, setTab] = useState("plan");
  const [expandedAgent, setExpandedAgent] = useState<string | null>("exploit");

  const toolResults = chatSeed.filter((m) => m.toolCall);

  return (
    <div className={screen.bleed}>
      <div className={s.console}>
        {/* Orchestrator / subagent tree */}
        <aside className={s.orchTree} aria-label="Orchestrator tree">
          <span className="t-caption-caps" style={{ padding: "0 var(--space-sm) var(--space-xs)" }}>Orchestrator</span>
          {orchestratorTree.map((node) => (
            <div
              key={node.id}
              className={`${s.orchNode} ${node.role === "subagent" ? s.orchNodeSub : ""}`}
              data-role={node.role}
              aria-expanded={expandedAgent === node.id}
              aria-label={`${node.name} — ${agentStatusLabel(node.status)}`}
              {...clickable(() => setExpandedAgent(expandedAgent === node.id ? null : node.id))}
            >
              <div className={s.orchNodeTop}>
                <StatusDot status={node.status} />
                <span className="t-body-sm-strong grow" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
                <Sparkline data={node.activity} width={44} height={16} color={node.status === "error" ? "var(--negative)" : "var(--accent)"} />
              </div>
              {expandedAgent === node.id && (
                <div className="col gap-xs" style={{ paddingLeft: 16 }}>
                  <span className="t-caption">{agentStatusLabel(node.status)}</span>
                  {node.task && <span className="t-caption t-mute">{node.task}</span>}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Tabbed workspace */}
        <div className={s.consoleMain}>
          <div className={s.consoleTabWrap}>
            {/* small-screen status strip */}
            <div className="row gap-xs wrap" style={{ marginBottom: "var(--space-sm)" }}>
              {orchestratorTree.map((n) => (
                <span key={n.id} className="row gap-xs" style={{ fontSize: "var(--fs-caption)", color: "var(--mute)" }}>
                  <StatusDot status={n.status} /> {n.name}
                </span>
              ))}
            </div>
            <Tabs
              tabs={[
                { value: "plan", label: "Plan", icon: <Check size={14} /> },
                { value: "targets", label: "Target Overview" },
                { value: "threat", label: "Threat Map" },
                { value: "findings", label: "Findings" },
                { value: "tools", label: "Tool Results", icon: <Terminal size={14} /> },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>

          <div className={s.consolePanel}>
            {tab === "plan" && (
              <div className="col gap-sm">
                {planTasks.map((t) => (
                  <div key={t.id} className={s.taskRow}>
                    <GripVertical size={16} className={s.taskGrip} />
                    <span className={s.taskCheck} data-done={t.status === "done"}>
                      {t.status === "done" && <Check size={13} />}
                    </span>
                    <span className="t-body-sm grow" style={{ textDecoration: t.status === "done" ? "line-through" : "none", color: t.status === "done" ? "var(--mute)" : "var(--ink)" }}>
                      {t.label}
                    </span>
                    <StatusChip tone={TASK_TONE[t.status]}>{t.status}</StatusChip>
                    {t.status !== "done" && (
                      <button
                        className="t-caption row gap-xs"
                        style={{ color: "var(--accent)" }}
                        onClick={() => {
                          setRailView("chat");
                          toast.push("Step handed to the orchestrator.", { tone: "info" });
                        }}
                      >
                        <Play size={13} /> Run this step
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "targets" && <TargetOverviewView embedded />}
            {tab === "threat" && <ThreatMapView embedded />}
            {tab === "findings" && <FindingsView embedded />}

            {tab === "tools" && (
              <div className="col gap-md">
                {toolResults.map((m) => (
                  <div key={m.id} className="col gap-xs">
                    <div className="row gap-sm">
                      <StatusDot status={m.toolCall!.status === "done" ? "idle" : "running-tool"} />
                      <span className="t-caption">{m.subagent ?? "Orchestrator"}</span>
                      {m.toolCall!.summary && <span className="t-caption t-mute">· {m.toolCall!.summary}</span>}
                    </div>
                    <CodeBlock code={m.toolCall!.command} label="command" />
                    {m.toolCall!.output && (
                      <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "var(--space-md)" }}>
                        <pre className="t-mono-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--body)", whiteSpace: "pre-wrap", margin: 0 }}>{m.toolCall!.output}</pre>
                      </div>
                    )}
                  </div>
                ))}
                <div className="row gap-sm t-caption">
                  <ChevronRight size={13} /> Streaming continues in the chat rail's Output tab.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
