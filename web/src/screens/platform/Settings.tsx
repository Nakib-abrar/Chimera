import { useState } from "react";
import {
  CheckCircle2,
  CirclePlus,
  GripVertical,
  Info,
  KeyRound,
  Plug,
  Route,
  Server,
  ShieldAlert,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { FontScale } from "@/lib/types";
import {
  Button,
  Card,
  Field,
  MaskedInput,
  SegmentedControl,
  Select,
  StatusChip,
  Switch,
  TextInput,
} from "@/components/ui";
import { credentialPools, mountRoots, providers, routingRules } from "@/data/mock";
import { PlatformFrame } from "./PlatformFrame";
import s from "./platform.module.css";

type Sub =
  | "providers"
  | "routing"
  | "fallback"
  | "pools"
  | "execution"
  | "appearance"
  | "auth"
  | "about";

const SUBS: { id: Sub; label: string }[] = [
  { id: "providers", label: "Providers & Models" },
  { id: "routing", label: "Provider Routing" },
  { id: "fallback", label: "Fallback Providers" },
  { id: "pools", label: "Credential Pools" },
  { id: "execution", label: "Execution" },
  { id: "appearance", label: "Appearance" },
  { id: "auth", label: "Authentication" },
  { id: "about", label: "About / Licensing" },
];

export function Settings() {
  const { providerConfigured, setProviderConfigured, theme, setTheme, fontScale, setFontScale, navPinned, setNavPinned } = useApp();
  const [sub, setSub] = useState<Sub>("providers");
  const [execMode, setExecMode] = useState<"local" | "docker">("docker");

  return (
    <PlatformFrame showSettings={false}>
      <div className={s.settings}>
        <nav className={s.settingsNav} aria-label="Settings sections">
          {SUBS.map((it) => (
            <button
              key={it.id}
              className={s.settingsNavItem}
              data-active={sub === it.id}
              onClick={() => setSub(it.id)}
            >
              {it.label}
            </button>
          ))}
        </nav>

        <div className={s.settingsPane}>
          {!providerConfigured && (
            <div className={s.banner}>
              <TriangleAlert size={18} />
              Add a provider to activate a profile.
            </div>
          )}

          {sub === "providers" && (
            <>
              <div className="row between">
                <div className="col" style={{ gap: 2 }}>
                  <h2 className="t-heading-md">Providers & Models</h2>
                  <p className="t-caption">Add an LLM provider, then pick a default model.</p>
                </div>
                {providerConfigured ? (
                  <StatusChip tone="positive" dot><CheckCircle2 size={13} /> Ready</StatusChip>
                ) : (
                  <Button variant="primary" size="sm" icon={<CirclePlus size={15} />} onClick={() => setProviderConfigured(true)}>
                    Add provider
                  </Button>
                )}
              </div>
              <div className="col gap-md">
                {providers.map((p) => (
                  <Card key={p.id}>
                    <div className="row between" style={{ marginBottom: "var(--space-md)" }}>
                      <div className="row gap-sm">
                        <Server size={18} style={{ color: "var(--mute)" }} />
                        <span className="t-body-md-strong">{p.name}</span>
                      </div>
                      <StatusChip tone={p.status === "ready" ? "positive" : p.status === "error" ? "negative" : "warning"} dot>
                        {p.status === "ready" ? "Connected" : p.status === "error" ? "Error" : "Unverified"}
                      </StatusChip>
                    </div>
                    <div className={s.formGrid}>
                      <Field label="Base URL"><TextInput mono defaultValue={p.baseUrl} /></Field>
                      <Field label="API key"><MaskedInput defaultValue={p.keyMasked} /></Field>
                      <Field label="Default model">
                        <Select options={p.models.map((m) => ({ value: m, label: m }))} defaultValue={p.defaultModel} />
                      </Field>
                      <div className="col" style={{ justifyContent: "flex-end" }}>
                        <Button variant="secondary" icon={<Plug size={15} />}>Test connection</Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button variant="tertiary" icon={<CirclePlus size={16} />}>Add another provider</Button>
              </div>
            </>
          )}

          {sub === "routing" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">Provider Routing</h2>
                <p className="t-caption">Route each task class to the model that fits it best.</p>
              </div>
              <Card>
                <div className="col gap-sm">
                  {routingRules.map((r) => (
                    <div key={r.id} className={s.ruleRow}>
                      <TextInput defaultValue={r.taskClass} />
                      <Select options={providers.flatMap((p) => p.models).map((m) => ({ value: m, label: m }))} defaultValue={r.model} />
                      <Button variant="ghost" size="sm" aria-label="Remove rule"><Trash2 size={15} /></Button>
                    </div>
                  ))}
                  <div>
                    <Button variant="tertiary" size="sm" icon={<Route size={15} />}>Add routing rule</Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {sub === "fallback" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">Fallback Providers</h2>
                <p className="t-caption">Ordered fallback chain used on provider outage. Drag to reorder.</p>
              </div>
              <Card flush>
                {providers.map((p, i) => (
                  <div key={p.id} className={s.providerRow} style={{ border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0, background: "transparent" }}>
                    <div className="row gap-sm">
                      <GripVertical size={16} style={{ color: "var(--mute)", cursor: "grab" }} />
                      <span className="t-caption-caps">{i + 1}</span>
                      <span className="t-body-sm-strong">{p.name}</span>
                    </div>
                    <span className="t-caption">{p.defaultModel}</span>
                  </div>
                ))}
              </Card>
            </>
          )}

          {sub === "pools" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">Credential Pools</h2>
                <p className="t-caption">Named pools of API keys for rate-limited recon and OSINT services.</p>
              </div>
              <div className="col gap-md">
                {credentialPools.map((c) => (
                  <div key={c.id} className={s.providerRow}>
                    <div className="col" style={{ gap: 2 }}>
                      <span className="t-body-md-strong">{c.name}</span>
                      <span className="t-caption">{c.purpose}</span>
                    </div>
                    <StatusChip tone="neutral"><KeyRound size={13} /> {c.keyCount} keys</StatusChip>
                  </div>
                ))}
                <Button variant="tertiary" size="sm" icon={<CirclePlus size={15} />}>New pool</Button>
              </div>
            </>
          )}

          {sub === "execution" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">Execution</h2>
                <p className="t-caption">Where tools run. Docker is recommended for isolation.</p>
              </div>
              <Card>
                <Field label="Execution mode">
                  <SegmentedControl
                    segments={[{ value: "local", label: "Local" }, { value: "docker", label: "Docker" }]}
                    value={execMode}
                    onChange={setExecMode}
                  />
                </Field>
                {execMode === "docker" && (
                  <div style={{ marginTop: "var(--space-lg)" }}>
                    <Field label="Declared workspace mount roots" help="These are set in docker-compose.yml / .env and shown here read-only. The app can never mount arbitrary host paths.">
                      <div className="col gap-sm">
                        {mountRoots.map((m) => (
                          <div key={m} className="row gap-sm" style={{ padding: "var(--space-sm) var(--space-md)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                            <ShieldAlert size={15} style={{ color: "var(--positive)" }} />
                            <span className="t-mono-md" style={{ fontFamily: "var(--font-mono)" }}>{m}</span>
                          </div>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}
              </Card>
            </>
          )}

          {sub === "appearance" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">Appearance</h2>
                <p className="t-caption">Theme, font scale, and nav defaults.</p>
              </div>
              <Card>
                <div className="col gap-lg">
                  <Field label="Theme">
                    <SegmentedControl
                      segments={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
                      value={theme}
                      onChange={setTheme}
                    />
                  </Field>
                  <Field label="Font scale">
                    <SegmentedControl<FontScale>
                      segments={[
                        { value: "compact", label: "Compact" },
                        { value: "default", label: "Default" },
                        { value: "comfortable", label: "Comfortable" },
                      ]}
                      value={fontScale}
                      onChange={setFontScale}
                    />
                  </Field>
                  <div className="row between">
                    <div className="col" style={{ gap: 2 }}>
                      <span className="t-body-md-strong">Pin nav rail by default</span>
                      <span className="t-caption">Keep the left navigation expanded with labels.</span>
                    </div>
                    <Switch on={navPinned} onChange={setNavPinned} label="Pin nav rail" />
                  </div>
                </div>
              </Card>
            </>
          )}

          {sub === "auth" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">Authentication</h2>
                <p className="t-caption">Rotate the single shared secret that gates the console.</p>
              </div>
              <Card>
                <div className="col gap-lg" style={{ maxWidth: 420 }}>
                  <Field label="Current secret"><MaskedInput placeholder="Current secret" /></Field>
                  <Field label="New secret"><MaskedInput placeholder="New secret" /></Field>
                  <Field label="Confirm new secret"><MaskedInput placeholder="Confirm" /></Field>
                  <div><Button variant="primary" icon={<KeyRound size={15} />}>Rotate secret</Button></div>
                </div>
              </Card>
            </>
          )}

          {sub === "about" && (
            <>
              <div className="col" style={{ gap: 2 }}>
                <h2 className="t-heading-md">About / Licensing</h2>
              </div>
              <Card>
                <div className="col gap-md">
                  <div className="row between"><span className="t-body-sm">Chimera Console</span><span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>v1.0.0</span></div>
                  <div className="row between"><span className="t-body-sm">Graph layer</span><span className="t-caption">Sigma.js + graphology</span></div>
                  <div className="row gap-sm t-caption"><Info size={14} /> Built with Hermes / Graphify attribution per master plan §13.</div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </PlatformFrame>
  );
}
