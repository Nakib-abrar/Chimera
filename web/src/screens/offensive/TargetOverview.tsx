import { useMemo, useState } from "react";
import { Eye, EyeOff, LayoutGrid, Lock, Network, Search, Table2 } from "lucide-react";
import type { Asset } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import {
  Card,
  DataTable,
  Drawer,
  EmptyState,
  SegmentedControl,
  SeverityMiniBar,
  StatusChip,
  TextInput,
  type Column,
} from "@/components/ui";
import { totalFindings } from "@/lib/ui";
import { assets } from "@/data/mock";
import s from "./offensive.module.css";
import ui from "@/components/ui/ui.module.css";

const RECON_TONE = { pending: "neutral", scanning: "warning", enumerated: "accent", verified: "positive" } as const;
const CRIT_TONE = { low: "neutral", medium: "warning", high: "negative", "crown-jewel": "negative" } as const;

export function TargetOverviewView({ embedded }: { embedded?: boolean }) {
  const [view, setView] = useState<"table" | "cards">("table");
  const [query, setQuery] = useState("");
  const [reconFilter, setReconFilter] = useState<string>("all");
  const [detail, setDetail] = useState<Asset | null>(null);
  const [revealCreds, setRevealCreds] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets
      .filter((a) => (reconFilter === "all" ? true : a.reconStatus === reconFilter))
      .filter((a) => (q ? a.host.toLowerCase().includes(q) : true))
      .sort((a, b) => totalFindings(b.findingCounts) - totalFindings(a.findingCounts));
  }, [query, reconFilter]);

  const columns: Column<Asset>[] = [
    {
      key: "host",
      header: "Host",
      render: (a) => (
        <div className="col" style={{ gap: 2 }}>
          <span className="t-mono-md t-ink" style={{ fontFamily: "var(--font-mono)" }}>{a.host}</span>
          <span className="t-caption">{a.kind}{a.ip ? ` · ${a.ip}` : ""}</span>
        </div>
      ),
      sortValue: (a) => a.host,
    },
    { key: "recon", header: "Recon", hideBelow: "tablet", render: (a) => <StatusChip tone={RECON_TONE[a.reconStatus]} dot>{a.reconStatus}</StatusChip> },
    {
      key: "tech",
      header: "Tech",
      hideBelow: "tablet",
      render: (a) => (
        <div className="row gap-xs wrap">
          {a.tech.slice(0, 3).map((t) => <span key={t} className={s.techTag}>{t}</span>)}
          {a.tech.length === 0 && <span className="t-caption t-mute">—</span>}
        </div>
      ),
    },
    {
      key: "creds",
      header: "Creds",
      hideBelow: "mobile",
      render: (a) => a.credentials > 0 ? <span className="row gap-xs t-body-sm"><Lock size={13} style={{ color: "var(--warning)" }} /> {a.credentials}</span> : <span className="t-caption t-mute">—</span>,
    },
    { key: "crit", header: "Criticality", hideBelow: "mobile", render: (a) => <StatusChip tone={CRIT_TONE[a.criticality]}>{a.criticality}</StatusChip>, sortValue: (a) => a.criticality },
    { key: "findings", header: "Findings", render: (a) => <SeverityMiniBar counts={a.findingCounts} />, sortValue: (a) => totalFindings(a.findingCounts) },
  ];

  const controls = (
    <div className="row gap-sm wrap">
      <div className={ui.inputWrap} style={{ width: 220 }}>
        <TextInput mono placeholder="host…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 34 }} />
        <Search size={15} style={{ position: "absolute", left: 10, color: "var(--mute)" }} />
      </div>
      <select className={ui.select} value={reconFilter} onChange={(e) => setReconFilter(e.target.value)} style={{ width: 160 }}>
        <option value="all">All recon states</option>
        <option value="pending">Pending</option>
        <option value="scanning">Scanning</option>
        <option value="enumerated">Enumerated</option>
        <option value="verified">Verified</option>
      </select>
      <SegmentedControl
        segments={[
          { value: "table", label: "Table", icon: <Table2 size={15} /> },
          { value: "cards", label: "Cards", icon: <LayoutGrid size={15} /> },
        ]}
        value={view}
        onChange={setView}
      />
    </div>
  );

  const body =
    filtered.length === 0 ? (
      <EmptyState
        icon={<Network />}
        title="No assets match"
        hint="Run recon to populate — try asking the orchestrator to enumerate subdomains."
      />
    ) : view === "table" ? (
      <DataTable columns={columns} rows={filtered} rowKey={(a) => a.id} onRowClick={setDetail} defaultSort={{ key: "findings", dir: "desc" }} />
    ) : (
      <div className={s.targetGrid}>
        {filtered.map((a) => (
          <Card key={a.id} interactive onClick={() => setDetail(a)}>
            <div className="row between" style={{ marginBottom: "var(--space-sm)" }}>
              <span className="t-mono-md t-ink" style={{ fontFamily: "var(--font-mono)" }}>{a.host}</span>
              <StatusChip tone={CRIT_TONE[a.criticality]}>{a.criticality}</StatusChip>
            </div>
            <div className="row gap-xs wrap" style={{ marginBottom: "var(--space-sm)" }}>
              {a.tech.map((t) => <span key={t} className={s.techTag}>{t}</span>)}
            </div>
            <div className="row between">
              <StatusChip tone={RECON_TONE[a.reconStatus]} dot>{a.reconStatus}</StatusChip>
              <SeverityMiniBar counts={a.findingCounts} width={72} />
            </div>
          </Card>
        ))}
      </div>
    );

  const drawer = (
    <Drawer open={!!detail} onClose={() => { setDetail(null); setRevealCreds(false); }} title={detail?.host} subtitle={detail?.kind}>
      {detail && (
        <>
          <div className="row gap-sm wrap">
            <StatusChip tone={RECON_TONE[detail.reconStatus]} dot>{detail.reconStatus}</StatusChip>
            <StatusChip tone={CRIT_TONE[detail.criticality]}>{detail.criticality}</StatusChip>
          </div>
          <div className="col gap-sm">
            <span className="t-caption-caps">Network</span>
            <div className="row between t-body-sm"><span className="t-mute">IP</span><span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{detail.ip ?? "—"}</span></div>
            <div className="row between t-body-sm"><span className="t-mute">Open ports</span><span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{detail.ports?.join(", ") ?? "—"}</span></div>
            <div className="row between t-body-sm"><span className="t-mute">Web app</span><span>{detail.webApp ?? "—"}</span></div>
          </div>
          <div className="col gap-sm">
            <span className="t-caption-caps">Tech stack</span>
            <div className="row gap-xs wrap">{detail.tech.map((t) => <span key={t} className={s.techTag}>{t}</span>)}</div>
          </div>
          <div className="col gap-sm">
            <div className="row between">
              <span className="t-caption-caps">Pre-configured credentials</span>
              {detail.credentials > 0 && (
                <button className="t-caption row gap-xs" onClick={() => setRevealCreds((v) => !v)}>
                  {revealCreds ? <EyeOff size={13} /> : <Eye size={13} />} {revealCreds ? "Hide" : "Reveal"}
                </button>
              )}
            </div>
            {detail.credentials > 0 ? (
              <code className="t-mono-sm" style={{ fontFamily: "var(--font-mono)", background: "var(--surface-inset)", padding: "8px 10px", borderRadius: "var(--radius-sm)" }}>
                {revealCreds ? `admin:S3cr3t! · svc_deploy:••uncovered··` : `${detail.credentials} stored credential(s) — hidden`}
              </code>
            ) : (
              <span className="t-body-sm t-mute">None stored.</span>
            )}
          </div>
          <div className="col gap-sm">
            <span className="t-caption-caps">Findings</span>
            <SeverityMiniBar counts={detail.findingCounts} width={200} />
          </div>
        </>
      )}
    </Drawer>
  );

  const header = (
    <ScreenHeader
      title="Target Overview"
      subtitle="Every in-scope asset with recon status, tech stack, stored credentials, and finding counts."
      actions={controls}
    />
  );

  if (embedded) {
    return (
      <div>
        <div style={{ marginBottom: "var(--space-md)" }}>{header}</div>
        {body}
        {drawer}
      </div>
    );
  }
  return (
    <Screen>
      {header}
      {body}
      {drawer}
    </Screen>
  );
}

export function TargetOverview() {
  return <TargetOverviewView />;
}
