import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Crosshair, Layers, Maximize2, Minus, Plus, Search } from "lucide-react";
import type { GraphEdge, GraphNode } from "@/lib/types";
import { SEVERITY_META } from "@/lib/ui";
import g from "./graph.module.css";

const W = 1000;
const H = 680;
const LABEL_ZOOM = 0.7;

export interface LegendItem {
  label: string;
  color: string;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  mode?: "surface" | "chain" | "coverage";
  onNodeClick?: (node: GraphNode) => void;
  topLeft?: ReactNode;
  legend?: LegendItem[];
  showMinimap?: boolean;
}

function nodeColor(n: GraphNode): string {
  if (n.severity) return SEVERITY_META[n.severity].token;
  if (n.type === "cluster") return "var(--accent)";
  if (n.type === "risk") return "var(--sev-high)";
  return "var(--accent)";
}

function nodeRadius(n: GraphNode): number {
  if (n.type === "cluster") return 36;
  if (n.type === "domain") return 26;
  if (n.type === "risk") return 15;
  const f = n.findings ?? 0;
  return Math.min(30, 15 + f * 3);
}

export function GraphCanvas({
  nodes,
  edges,
  mode = "surface",
  onNodeClick,
  topLeft,
  legend,
  showMinimap = true,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [t, setT] = useState({ k: 1, tx: 0, ty: 0 });
  const [query, setQuery] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, GraphNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const px = useCallback((n: GraphNode) => ({ x: n.x * W, y: n.y * H }), []);

  const toVB = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const vb = toVB(e.clientX, e.clientY);
      setT((prev) => {
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        const k = Math.max(0.35, Math.min(3.5, prev.k * factor));
        const worldX = (vb.x - prev.tx) / prev.k;
        const worldY = (vb.y - prev.ty) / prev.k;
        return { k, tx: vb.x - k * worldX, ty: vb.y - k * worldY };
      });
    },
    [toVB],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      dragging.current = true;
      last.current = toVB(e.clientX, e.clientY);
    },
    [toVB],
  );
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !last.current) return;
      const now = toVB(e.clientX, e.clientY);
      const dx = now.x - last.current.x;
      const dy = now.y - last.current.y;
      last.current = now;
      setT((prev) => ({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy }));
    },
    [toVB],
  );
  const onPointerUp = useCallback(() => {
    dragging.current = false;
    last.current = null;
  }, []);

  const zoomBy = (factor: number) =>
    setT((prev) => {
      const k = Math.max(0.35, Math.min(3.5, prev.k * factor));
      const cx = W / 2;
      const cy = H / 2;
      const worldX = (cx - prev.tx) / prev.k;
      const worldY = (cy - prev.ty) / prev.k;
      return { k, tx: cx - k * worldX, ty: cy - k * worldY };
    });
  const fit = () => setT({ k: 1, tx: 0, ty: 0 });

  const match = query.trim().toLowerCase();
  const showLabels = t.k >= LABEL_ZOOM;

  return (
    <div className={g.wrap}>
      <svg
        ref={svgRef}
        className={g.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label={`${mode} graph with ${nodes.length} nodes`}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--border-strong)" />
          </marker>
        </defs>
        <g transform={`translate(${t.tx} ${t.ty}) scale(${t.k})`}>
          {/* edges */}
          {edges.map((e) => {
            const s = byId.get(e.source);
            const d = byId.get(e.target);
            if (!s || !d) return null;
            const sp = px(s);
            const dp = px(d);
            const mx = (sp.x + dp.x) / 2;
            const my = (sp.y + dp.y) / 2;
            return (
              <g key={e.id}>
                <line
                  x1={sp.x}
                  y1={sp.y}
                  x2={dp.x}
                  y2={dp.y}
                  className={g.edge}
                  markerEnd={e.directed ? "url(#arrow)" : undefined}
                />
                {e.label && <text x={mx} y={my - 6} className={g.edgeLabel}>{e.label}</text>}
              </g>
            );
          })}

          {/* nodes */}
          {nodes.map((n, i) => {
            const p = px(n);
            const isMatch = match.length > 0 && n.label.toLowerCase().includes(match);
            const dim = match.length > 0 && !isMatch;
            const color = nodeColor(n);

            if (n.type === "step") {
              const bw = 168;
              const bh = 60;
              return (
                <g
                  key={n.id}
                  className={g.node}
                  transform={`translate(${p.x - bw / 2} ${p.y - bh / 2})`}
                  onClick={() => onNodeClick?.(n)}
                  style={{
                    opacity: dim ? 0.35 : 1,
                    animation: `stepIn 320ms var(--ease-out) ${i * 120}ms both`,
                  }}
                >
                  <rect width={bw} height={bh} rx={12} fill="var(--surface-raised)" stroke={color} strokeWidth={isMatch ? 2.5 : 1.5} />
                  <circle cx={16} cy={16} r={9} fill={color} />
                  <text x={16} y={16} className={g.clusterBadge}>{n.step}</text>
                  <text x={34} y={20} className={g.nodeLabel} textAnchor="start" style={{ fontWeight: 600, fill: "var(--ink)" }}>
                    {n.label.length > 18 ? n.label.slice(0, 17) + "…" : n.label}
                  </text>
                  {n.techniqueId && (
                    <text x={16} y={44} className={g.nodeLabel} textAnchor="start" style={{ fontSize: 11, fill: "var(--mute)" }}>
                      {n.techniqueId}
                    </text>
                  )}
                </g>
              );
            }

            const r = nodeRadius(n);
            return (
              <g
                key={n.id}
                className={g.node}
                onClick={() => onNodeClick?.(n)}
                style={{ opacity: dim ? 0.3 : 1 }}
              >
                {n.severity && <circle cx={p.x} cy={p.y} r={r + 7} fill={color} opacity={0.16} />}
                {isMatch && <circle cx={p.x} cy={p.y} r={r + 10} fill="none" stroke="var(--accent)" strokeWidth={2} />}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={n.type === "cluster" ? "var(--surface-raised)" : "var(--surface-raised)"}
                  stroke={color}
                  strokeWidth={n.type === "cluster" ? 1.5 : 2}
                  strokeDasharray={n.type === "cluster" ? "4 3" : undefined}
                />
                {n.type === "cluster" && (
                  <>
                    <circle cx={p.x} cy={p.y} r={r - 12} fill={color} opacity={0.9} />
                    <text x={p.x} y={p.y} className={g.clusterBadge}>{n.count}</text>
                  </>
                )}
                {n.severity && (n.findings ?? 0) > 0 && (
                  <text x={p.x} y={p.y + 4} className={g.clusterBadge} style={{ fill: color, fontWeight: 700 }}>
                    {n.findings}
                  </text>
                )}
                {showLabels && (
                  <text
                    x={p.x}
                    y={p.y + r + 15}
                    className={`${g.nodeLabel} ${n.type === "domain" ? g.nodeLabelStrong : ""}`}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Chrome */}
      <div className={g.chromeTL}>{topLeft}</div>

      <div className={g.chromeTR}>
        <div className={g.searchBox}>
          <Search />
          <input
            placeholder="Find node…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search graph nodes"
          />
        </div>
        <div className={g.toolGroup}>
          <button className={g.toolBtn} onClick={() => zoomBy(1.2)} aria-label="Zoom in"><Plus /></button>
          <button className={g.toolBtn} onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out"><Minus /></button>
          <button className={g.toolBtn} onClick={fit} aria-label="Fit to view"><Maximize2 /></button>
          <button className={g.toolBtn} onClick={() => setShowLegend((v) => !v)} aria-label="Toggle legend"><Layers /></button>
        </div>
      </div>

      {showLegend && legend && legend.length > 0 && (
        <div className={g.chromeBL}>
          <div className={g.legend}>
            {legend.map((l) => (
              <div key={l.label} className={g.legendRow}>
                <span className={g.legendSwatch} style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {showMinimap && (
        <div className={g.chromeBR}>
          <svg className={g.minimap} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            {nodes.map((n) => {
              const p = px(n);
              return <circle key={n.id} cx={p.x} cy={p.y} r={n.type === "cluster" ? 22 : 12} fill={nodeColor(n)} opacity={0.7} />;
            })}
            <rect
              className={g.minimapRect}
              x={(-t.tx) / t.k}
              y={(-t.ty) / t.k}
              width={W / t.k}
              height={H / t.k}
            />
          </svg>
        </div>
      )}

      <div className={g.hint} aria-hidden="true">
        <Crosshair size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />
        drag to pan · scroll to zoom · click a node for detail
      </div>
    </div>
  );
}
