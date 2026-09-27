import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Check, Loader2, ShieldCheck, Swords } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Profile } from "@/lib/types";
import { Button, Modal, StatusChip } from "@/components/ui";
import { ChimeraMark } from "./ChimeraMark";
import s from "./shell.module.css";

const STEPS = [
  "Persisting session state…",
  "Stopping the other profile…",
  "Cold-starting the new profile…",
  "Loading context…",
];

export function ProfileSwitcher({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current: "offensive" | "defensive";
}) {
  const navigate = useNavigate();
  const { setProfile, providerConfigured } = useApp();
  const [confirming, setConfirming] = useState<Profile | null>(null);
  const [transitionTo, setTransitionTo] = useState<Profile | null>(null);
  const [stepIdx, setStepIdx] = useState(-1);

  useEffect(() => {
    if (!open) {
      setConfirming(null);
    }
  }, [open]);

  useEffect(() => {
    if (!transitionTo) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepMs = reduce ? 90 : 420;
    let i = 0;
    setStepIdx(0);
    const iv = window.setInterval(() => {
      i += 1;
      if (i >= STEPS.length) {
        window.clearInterval(iv);
        window.setTimeout(() => {
          setProfile(transitionTo);
          navigate(transitionTo === "offensive" ? "/offensive/console" : "/defensive/overview");
          setTransitionTo(null);
          setStepIdx(-1);
          onClose();
        }, stepMs);
      } else {
        setStepIdx(i);
      }
    }, stepMs);
    return () => window.clearInterval(iv);
  }, [transitionTo, navigate, setProfile, onClose]);

  const beginSwitch = (target: Profile) => {
    setConfirming(null);
    setTransitionTo(target);
  };

  if (transitionTo) {
    return createPortal(
      <div className={s.transition} data-profile={transitionTo}>
        <ChimeraMark size={72} className={s.transitionGlyph} />
        <div className="t-heading-lg">
          Switching to {transitionTo === "offensive" ? "Offensive" : "Defensive"}
        </div>
        <div className={s.checklist}>
          {STEPS.map((step, i) => (
            <div key={step} className={s.checkRow} data-done={i <= stepIdx}>
              {i < stepIdx ? <Check /> : i === stepIdx ? <Loader2 className="spin" style={{ color: "var(--accent)", animation: "chimera-spin 0.8s linear infinite" }} /> : <span style={{ width: 16 }} />}
              {step}
            </div>
          ))}
        </div>
      </div>,
      document.body,
    );
  }

  const Cards = (
    <div className="row gap-lg wrap" style={{ alignItems: "stretch" }}>
      {(["offensive", "defensive"] as const).map((p) => {
        const isActive = p === current;
        const isConfirming = confirming === p;
        return (
          <div key={p} className={s.profileCard} data-kind={p} data-profile={p} style={{ cursor: "default" }}>
            <div className="row between">
              <span className={s.profileIcon} style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                {p === "offensive" ? <Swords /> : <ShieldCheck />}
              </span>
              {isActive && <StatusChip tone="accent" dot>Running</StatusChip>}
            </div>
            <div className="t-heading-md">{p === "offensive" ? "Offensive" : "Defensive"}</div>
            <div className="t-body-sm t-mute">
              {p === "offensive" ? "Bug bounty & pentest" : "SOC · threat hunting · IR"}
            </div>
            {p === "defensive" && !isActive && (
              <div className="t-caption" style={{ color: "var(--accent)" }}>3 scheduled jobs will run on activation</div>
            )}

            {isConfirming ? (
              <div className="col gap-sm" style={{ marginTop: "auto" }}>
                <div className="t-caption" style={{ color: "var(--warning)" }}>
                  Switching to {p === "offensive" ? "Offensive" : "Defensive"} will stop all {current} activity — 2 running subagents, 1 browser session, and any attached containers will be terminated. Session state is saved.
                </div>
                <div className="row gap-sm">
                  <Button size="sm" variant="primary" onClick={() => beginSwitch(p)}>Save & Switch</Button>
                  <Button size="sm" variant="tertiary" onClick={() => setConfirming(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "auto" }}>
                {isActive ? (
                  <Button size="sm" variant="secondary" disabled block>Active profile</Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    block
                    disabled={!providerConfigured}
                    onClick={() => setConfirming(p)}
                  >
                    {providerConfigured ? `Switch to ${p === "offensive" ? "Offensive" : "Defensive"}` : "Configure a provider first"}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} wide title="Switch profile">
      <div className="col gap-md">
        <p className="t-body-sm t-mute">
          One profile runs at a time. Switching fully stops the other profile's process tree — this is Chimera's hard isolation boundary.
        </p>
        {Cards}
      </div>
    </Modal>
  );
}
