import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Check, Loader2, ShieldCheck, Swords } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Profile } from "@/lib/types";
import { clickable } from "@/lib/ui";
import { Button, StatusChip } from "@/components/ui";
import { ChimeraMark } from "@/components/shell/ChimeraMark";
import { PlatformFrame } from "./PlatformFrame";
import shell from "@/components/shell/shell.module.css";
import s from "./platform.module.css";

const STEPS = ["Persisting session state…", "Cold-starting profile…", "Loading context…"];

export function ProfileLanding() {
  const navigate = useNavigate();
  const { setProfile, providerConfigured } = useApp();
  const [transitionTo, setTransitionTo] = useState<Profile | null>(null);
  const [stepIdx, setStepIdx] = useState(-1);

  const enter = (p: Profile) => {
    if (!providerConfigured) {
      navigate("/settings");
      return;
    }
    setTransitionTo(p);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepMs = reduce ? 90 : 430;
    let i = 0;
    setStepIdx(0);
    const iv = window.setInterval(() => {
      i += 1;
      if (i >= STEPS.length) {
        window.clearInterval(iv);
        window.setTimeout(() => {
          setProfile(p);
          navigate(p === "offensive" ? "/offensive/console" : "/defensive/overview");
        }, stepMs);
      } else setStepIdx(i);
    }, stepMs);
  };

  if (transitionTo) {
    return createPortal(
      <div className={shell.transition} data-profile={transitionTo}>
        <ChimeraMark size={72} />
        <div className="t-heading-lg">Entering {transitionTo === "offensive" ? "Offensive" : "Defensive"}</div>
        <div className={shell.checklist}>
          {STEPS.map((step, i) => (
            <div key={step} className={shell.checkRow} data-done={i <= stepIdx}>
              {i < stepIdx ? <Check /> : i === stepIdx ? <Loader2 style={{ color: "var(--accent)", animation: "chimera-spin 0.8s linear infinite" }} /> : <span style={{ width: 16 }} />}
              {step}
            </div>
          ))}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <PlatformFrame>
      <div className={s.landing}>
        <div className="col" style={{ gap: 6 }}>
          <h1 className="t-display-md">Which world are you entering?</h1>
          <p className="t-body-md t-mute">One profile runs at a time. Opening one stops the other.</p>
        </div>

        {!providerConfigured && (
          <div className={s.banner}>
            Configure a provider in Settings before activating a profile.
          </div>
        )}

        <div className={s.landingCards}>
          <div className={shell.profileCard} data-kind="offensive" data-profile="offensive">
            <div className="row between">
              <span className={shell.profileIcon} style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                <Swords />
              </span>
              <StatusChip tone="neutral">Bug bounty & pentest</StatusChip>
            </div>
            <div className="t-heading-lg">Offensive</div>
            <p className="t-body-sm t-mute">Recon, exploitation with approval checkpoints, findings, and client-ready reports.</p>
            <div className="t-caption">Last engagement: acme-corp · 4 open findings</div>
            <div style={{ marginTop: "auto", paddingTop: "var(--space-md)" }}>
              <Button variant="primary" block onClick={() => enter("offensive")} disabled={!providerConfigured}>
                Enter Offensive
              </Button>
            </div>
          </div>

          <div className={shell.profileCard} data-kind="defensive" data-profile="defensive">
            <div className="row between">
              <span className={shell.profileIcon} style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                <ShieldCheck />
              </span>
              <StatusChip tone="neutral">SOC · hunting · IR</StatusChip>
            </div>
            <div className="t-heading-lg">Defensive</div>
            <p className="t-body-sm t-mute">Alert triage, threat hunting, incident response, and detection engineering.</p>
            <div className="t-caption">3 open cases · 12 alerts today</div>
            <div style={{ marginTop: "auto", paddingTop: "var(--space-md)" }}>
              <Button variant="primary" block onClick={() => enter("defensive")} disabled={!providerConfigured}>
                Enter Defensive
              </Button>
            </div>
          </div>
        </div>

        <div className="col gap-sm">
          <span className="t-caption-caps">Recent</span>
          <div className={s.recentStrip}>
            <span className={s.recentChip} {...clickable(() => enter("offensive"))} aria-label="Open acme-corp">
              <span className={shell.pillDot} style={{ background: "var(--accent-offensive)" }} /> acme-corp
              <StatusChip tone="positive">Active</StatusChip>
            </span>
            <span className={s.recentChip} {...clickable(() => enter("offensive"))} aria-label="Open northwind-pentest">
              <span className={shell.pillDot} style={{ background: "var(--accent-offensive)" }} /> northwind-pentest
              <StatusChip tone="warning">Reporting</StatusChip>
            </span>
            <span className={s.recentChip} {...clickable(() => enter("defensive"))} aria-label="Open cred-stuffing-vpn">
              <span className={shell.pillDot} style={{ background: "var(--accent-defensive)" }} /> cred-stuffing-vpn
              <StatusChip tone="warning">Contained</StatusChip>
            </span>
          </div>
        </div>
      </div>
    </PlatformFrame>
  );
}
