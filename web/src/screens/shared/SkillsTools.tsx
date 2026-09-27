import { useState } from "react";
import { Bot, CircleFadingPlus, Download, Plus, Search, Wand2 } from "lucide-react";
import type { Skill, ToolEntry } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import { Button, StatusChip, Switch, TextInput, TtpChip, useToast } from "@/components/ui";
import {
  defensiveSkills,
  defensiveTools,
  offensiveSkills,
  offensiveTools,
} from "@/data/mock";
import { SkillImportWizard } from "./SkillImportWizard";
import { MetaAgentBuilder } from "./MetaAgentBuilder";
import s from "@/screens/offensive/offensive.module.css";
import ui from "@/components/ui/ui.module.css";

function sensitivityTone(sensitivity: Skill["sensitivity"]) {
  if (sensitivity === "RUN_EXPLOIT") return "warning" as const;
  if (sensitivity === "none") return "neutral" as const;
  return "accent" as const;
}

export function SkillsToolsView({ profile }: { profile: "offensive" | "defensive" }) {
  const toast = useToast();
  const initialSkills = profile === "offensive" ? offensiveSkills : defensiveSkills;
  const initialTools = profile === "offensive" ? offensiveTools : defensiveTools;
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [tools, setTools] = useState<ToolEntry[]>(initialTools);
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);

  const filtered = skills.filter((sk) => sk.name.toLowerCase().includes(query.trim().toLowerCase()));

  const toggleSkill = (id: string) => setSkills((prev) => prev.map((sk) => (sk.id === id ? { ...sk, enabled: !sk.enabled } : sk)));
  const toggleTool = (id: string) => setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));

  return (
    <Screen>
      <ScreenHeader
        title="Skills & Tools"
        subtitle="Skills carry ATT&CK TTP metadata (the TTP Library); tools are the profile's toolbox."
        actions={
          <>
            <Button variant="secondary" icon={<Plus size={15} />} onClick={() => toast.push("Opening the manual builder form…", { tone: "info" })}>New</Button>
            <Button variant="secondary" icon={<Download size={15} />} onClick={() => setImportOpen(true)}>Import skill</Button>
            <Button variant="primary" icon={<Wand2 size={15} />} onClick={() => setMetaOpen(true)}>Ask AI to set this up</Button>
          </>
        }
      />

      <section>
        <div className="row between" style={{ marginBottom: "var(--space-md)" }}>
          <h2 className="t-heading-md">Skills library</h2>
          <div className={ui.inputWrap} style={{ width: 220 }}>
            <TextInput placeholder="Filter skills…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 34 }} />
            <Search size={15} style={{ position: "absolute", left: 10, color: "var(--mute)" }} />
          </div>
        </div>
        <div className={s.skillGrid}>
          {filtered.map((sk) => (
            <div key={sk.id} className={s.skillCard}>
              <div className="row between">
                <span className="t-mono-md t-ink" style={{ fontFamily: "var(--font-mono)" }}>{sk.name}</span>
                <Switch on={sk.enabled} onChange={() => toggleSkill(sk.id)} label={`Toggle ${sk.name}`} />
              </div>
              <p className="t-body-sm t-mute">{sk.description}</p>
              <div className="row gap-xs wrap">
                <StatusChip tone="neutral">{sk.platform}</StatusChip>
                {sk.techniqueId !== "—" && <TtpChip>{sk.techniqueId}</TtpChip>}
                {sk.sensitivity !== "none" && <StatusChip tone={sensitivityTone(sk.sensitivity)}>{sk.sensitivity}</StatusChip>}
              </div>
              {sk.toolDeps.length > 0 && (
                <div className="t-caption">deps: <span style={{ fontFamily: "var(--font-mono)" }}>{sk.toolDeps.join(", ")}</span></div>
              )}
              <button className="t-caption row gap-xs" style={{ color: "var(--accent)" }} onClick={() => setMetaOpen(true)}>
                <Bot size={13} /> Ask AI to set this up
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="t-heading-md" style={{ marginBottom: "var(--space-md)" }}>Tools / Toolbox</h2>
        <div className="col gap-sm">
          {tools.map((t) => (
            <div key={t.id} className={s.toolRow}>
              <div className="row gap-sm">
                <span className="t-mono-md t-ink" style={{ fontFamily: "var(--font-mono)" }}>{t.name}</span>
                <StatusChip tone="neutral">{t.category}</StatusChip>
              </div>
              <div className="row gap-md">
                {t.installed ? (
                  <StatusChip tone="positive" dot>installed</StatusChip>
                ) : t.selfHeal ? (
                  <StatusChip tone="warning"><CircleFadingPlus size={12} /> self-heals on first use</StatusChip>
                ) : (
                  <StatusChip tone="negative">not installed</StatusChip>
                )}
                <Switch on={t.enabled} onChange={() => toggleTool(t.id)} label={`Toggle ${t.name}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <SkillImportWizard open={importOpen} onClose={() => setImportOpen(false)} platform={profile} />
      <MetaAgentBuilder open={metaOpen} onClose={() => setMetaOpen(false)} />
    </Screen>
  );
}

export function OffensiveSkills() {
  return <SkillsToolsView profile="offensive" />;
}
export function DefensiveSkills() {
  return <SkillsToolsView profile="defensive" />;
}
