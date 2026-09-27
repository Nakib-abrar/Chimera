import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Circle,
  Info,
  KeyRound,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  TriangleAlert,
  Type,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { engagements, monitoredAssets, scopeEntries } from "@/data/mock";
import type { FontScale } from "@/lib/types";
import { useClickOutside } from "@/lib/useClickOutside";
import { SegmentedControl, StatusChip } from "@/components/ui";
import { ChimeraMark } from "./ChimeraMark";
import s from "./shell.module.css";

interface TopBarProps {
  profile: "offensive" | "defensive";
  onOpenSwitcher: () => void;
  onToggleRail: () => void;
}

export function TopBar({ profile, onOpenSwitcher, onToggleRail }: TopBarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme, fontScale, setFontScale, signOut, approvals } = useApp();
  const [menu, setMenu] = useState<null | "engagement" | "scope" | "user">(null);
  const close = useCallback(() => setMenu(null), []);
  const engRef = useClickOutside<HTMLDivElement>(menu === "engagement", close);
  const scopeRef = useClickOutside<HTMLDivElement>(menu === "scope", close);
  const userRef = useClickOutside<HTMLDivElement>(menu === "user", close);

  const eng = engagements[0];
  const inScope = scopeEntries.filter((e) => e.inScope).length;
  const health = {
    healthy: monitoredAssets.filter((a) => a.health === "healthy").length,
    degraded: monitoredAssets.filter((a) => a.health === "degraded").length,
    down: monitoredAssets.filter((a) => a.health === "down").length,
  };

  const home = profile === "offensive" ? "/offensive/console" : "/defensive/overview";

  return (
    <header className={s.topbar}>
      <button className={s.mark} onClick={() => navigate(home)} aria-label="Chimera home">
        <ChimeraMark className={s.markGlyph} />
        <span className={s.topbarWide}>Chimera</span>
      </button>

      <button className={s.profilePill} onClick={onOpenSwitcher} aria-label="Switch profile">
        <span className={s.pillDot} />
        {profile === "offensive" ? "OFFENSIVE" : "DEFENSIVE"}
        <ChevronDown />
      </button>

      {/* Engagement / case selector */}
      <div style={{ position: "relative" }} ref={engRef} className={s.topbarWide}>
        <button
          className={s.selector}
          onClick={() => setMenu(menu === "engagement" ? null : "engagement")}
        >
          {profile === "offensive" ? eng.name : "cred-stuffing-vpn"}
          <StatusChip tone={profile === "offensive" ? "positive" : "warning"} dot>
            {profile === "offensive" ? "Active" : "Contained"}
          </StatusChip>
          <ChevronDown />
        </button>
        {menu === "engagement" && (
          <div className={s.menu} style={{ top: 42, left: 0 }}>
            <div className={`${s.menuLabel} t-caption-caps`}>
              {profile === "offensive" ? "Engagements" : "Cases"}
            </div>
            {(profile === "offensive"
              ? engagements.map((e) => ({ id: e.id, name: e.name, status: e.status }))
              : [
                  { id: "c1", name: "cred-stuffing-vpn", status: "contained" },
                  { id: "c2", name: "ps-cradle-web-prod-2", status: "open" },
                ]
            ).map((row) => (
              <button key={row.id} className={s.menuItem} onClick={close}>
                <Circle size={8} style={{ fill: "var(--accent)", color: "var(--accent)" }} />
                {row.name}
                <span style={{ marginLeft: "auto" }} className="t-caption">
                  {row.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="spacer" />

      {/* Scope summary (offensive) / health (defensive) */}
      <div style={{ position: "relative" }} ref={scopeRef} className={s.topbarWide}>
        <button className={s.scopeSummary} onClick={() => setMenu(menu === "scope" ? null : "scope")}>
          {profile === "offensive" ? (
            <>
              <span className="t-mute">Scope:</span> {inScope} in-scope
              <span className={s.pillDot} style={{ background: "var(--scope-ok)" }} />
            </>
          ) : (
            <>
              <span className="t-mute">Assets:</span> {health.healthy} healthy
              <span className={s.pillDot} style={{ background: health.down ? "var(--negative)" : "var(--positive)" }} />
            </>
          )}
        </button>
        {menu === "scope" && (
          <div className={s.popover} style={{ top: 42, right: 0 }}>
            {profile === "offensive" ? (
              <div className="col gap-sm">
                <div className="row between">
                  <span className="t-heading-sm">Scope summary</span>
                  <button className="t-caption" style={{ color: "var(--accent)" }} onClick={() => { close(); navigate("/offensive/engagements"); }}>
                    Edit scope
                  </button>
                </div>
                {scopeEntries.slice(0, 5).map((e) => (
                  <div key={e.id} className="row gap-sm" style={{ justifyContent: "space-between" }}>
                    <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{e.pattern}</span>
                    <span className={s.pillDot} style={{ background: e.inScope ? "var(--scope-ok)" : "var(--scope-blocked)" }} />
                  </div>
                ))}
                <div className="t-caption">Enforced by the Scope Engine on every tool call.</div>
              </div>
            ) : (
              <div className="col gap-sm">
                <span className="t-heading-sm">Monitored assets</span>
                {monitoredAssets.map((a) => (
                  <div key={a.id} className="row between">
                    <span className="t-body-sm">{a.name}</span>
                    <StatusChip tone={a.health === "healthy" ? "positive" : a.health === "degraded" ? "warning" : "negative"} dot>
                      {a.health}
                    </StatusChip>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approvals (offensive queue) */}
      {profile === "offensive" && approvals.length > 0 && (
        <button className={s.approvalsPill} onClick={() => navigate("/offensive/approvals")} aria-label={`${approvals.length} approvals pending`}>
          <TriangleAlert />
          {approvals.length} approvals
        </button>
      )}

      {/* Chat rail toggle (tablet/mobile) */}
      <button className={`${s.selector} ${s.railToggleBtn}`} onClick={onToggleRail} aria-label="Toggle chat">
        <MessageSquare size={16} />
      </button>

      <button className={s.scopeSummary} onClick={toggleTheme} aria-label="Toggle theme" style={{ padding: "0 8px" }}>
        {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* User / settings menu */}
      <div style={{ position: "relative" }} ref={userRef}>
        <button className={s.scopeSummary} onClick={() => setMenu(menu === "user" ? null : "user")} aria-label="Settings menu" style={{ padding: "0 8px" }}>
          <Settings size={18} />
        </button>
        {menu === "user" && (
          <div className={s.menu} style={{ top: 42, right: 0 }}>
            <button className={s.menuItem} onClick={() => { close(); navigate("/settings"); }}>
              <Settings /> Settings
            </button>
            <div className={s.menuSep} />
            <div className={`${s.menuLabel} t-caption-caps`}>
              <span className="row gap-xs"><Type size={13} /> Font scale</span>
            </div>
            <div style={{ padding: "0 var(--space-md) var(--space-sm)" }}>
              <SegmentedControl<FontScale>
                block
                segments={[
                  { value: "compact", label: "Compact" },
                  { value: "default", label: "Default" },
                  { value: "comfortable", label: "Comfy" },
                ]}
                value={fontScale}
                onChange={setFontScale}
              />
            </div>
            <button className={s.menuItem} onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />} {theme === "dark" ? "Light theme" : "Dark theme"}
            </button>
            <div className={s.menuSep} />
            <button className={s.menuItem} onClick={() => { close(); navigate("/settings"); }}>
              <KeyRound /> Rotate shared secret
            </button>
            <button className={s.menuItem}>
              <Info /> About Chimera
            </button>
            <button className={s.menuItem} onClick={() => { close(); signOut(); navigate("/signin"); }}>
              <LogOut /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
