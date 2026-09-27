/* =============================================================================
   Chimera domain types (UI-side models for mock data)
   ========================================================================== */

export type Profile = "offensive" | "defensive" | "neutral";
export type Theme = "dark" | "light";
export type FontScale = "compact" | "default" | "comfortable";
export type ChatMode = "agent" | "manual" | "ask";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type EngagementStatus =
  | "active"
  | "paused"
  | "reporting"
  | "closed";

export type FindingStatus =
  | "new"
  | "verifying"
  | "verified"
  | "reported"
  | "dismissed";

export type AgentStatus =
  | "idle"
  | "thinking"
  | "running-tool"
  | "awaiting-approval"
  | "error";

export interface Engagement {
  id: string;
  name: string;
  type: "bug-bounty" | "pentest";
  status: EngagementStatus;
  scopeCount: number;
  lastActive: string;
  findingCounts: Record<Severity, number>;
  workspace: string;
}

export interface ScopeEntry {
  id: string;
  pattern: string;
  kind: "domain" | "ip" | "url" | "wildcard";
  inScope: boolean;
  source: string;
}

export interface Asset {
  id: string;
  host: string;
  kind: "domain" | "subdomain" | "ip" | "endpoint";
  reconStatus: "pending" | "scanning" | "enumerated" | "verified";
  tech: string[];
  ip?: string;
  ports?: number[];
  webApp?: string;
  credentials: number;
  criticality: "low" | "medium" | "high" | "crown-jewel";
  findingCounts: Record<Severity, number>;
  apex: string;
}

export interface EvidenceItem {
  id: string;
  kind: "request-response" | "screenshot" | "log" | "poc";
  label: string;
  hash: string;
  timestamp: string;
  preview?: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  asset: string;
  technique: string;
  techniqueId: string;
  cwe: string;
  cvss: number;
  impact: string;
  steps: string[];
  suggestedFix: string;
  evidence: EvidenceItem[];
}

export type IntentType =
  | "RUN_EXPLOIT"
  | "WRITE_FILE"
  | "EGRESS_CALL"
  | "INSTALL_TOOL"
  | "SPAWN_SUBAGENT";

export interface Approval {
  id: string;
  intent: IntentType;
  skill: string;
  target: string;
  targetInScope: boolean;
  requestedBy: string;
  origin: "direct" | "execute_code";
  command: string;
  createdAt: string;
}

export interface ApprovalDecision {
  id: string;
  intent: IntentType;
  skill: string;
  target: string;
  decision: "approved" | "denied";
  at: string;
}

export interface OrchestratorNode {
  id: string;
  name: string;
  role: "orchestrator" | "subagent";
  status: AgentStatus;
  task?: string;
  activity: number[];
}

export interface ToolCall {
  id: string;
  command: string;
  status: "running" | "done" | "error" | "pending-approval";
  output?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  author: "operator" | "agent" | "system";
  text?: string;
  toolCall?: ToolCall;
  subagent?: string;
  checkpoint?: { label: string };
  approval?: string;
  at: string;
}

export interface TaskItem {
  id: string;
  label: string;
  status: "todo" | "running" | "done" | "blocked";
}

/* ---- Graph ---- */
export interface GraphNode {
  id: string;
  label: string;
  type: "domain" | "subdomain" | "ip" | "endpoint" | "risk" | "cluster" | "step";
  severity?: Severity;
  findings?: number;
  cluster?: string;
  x: number;
  y: number;
  count?: number;
  techniqueId?: string;
  step?: number;
}
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  directed?: boolean;
}

/* ---- Skills / tools ---- */
export interface Skill {
  id: string;
  name: string;
  platform: "offensive" | "defensive" | "reporting";
  tactic: string;
  technique: string;
  techniqueId: string;
  toolDeps: string[];
  sensitivity: IntentType | "none";
  enabled: boolean;
  description: string;
}

export interface ToolEntry {
  id: string;
  name: string;
  installed: boolean;
  selfHeal: boolean;
  enabled: boolean;
  category: string;
}

/* ---- Providers ---- */
export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  keyMasked: string;
  defaultModel: string;
  status: "ready" | "unverified" | "error";
  models: string[];
}

export interface RoutingRule {
  id: string;
  taskClass: string;
  model: string;
}

export interface CredentialPool {
  id: string;
  name: string;
  keyCount: number;
  purpose: string;
}

/* =============================================================================
   Defensive
   ========================================================================== */
export type CaseStatus =
  | "open"
  | "contained"
  | "eradicated"
  | "recovered"
  | "closed";

export interface Alert {
  id: string;
  time: string;
  source: string;
  rule: string;
  severity: Severity;
  asset: string;
  suggestion: "likely-fp" | "investigate" | "escalate";
  description: string;
}

export interface SocCase {
  id: string;
  name: string;
  status: CaseStatus;
  severity: Severity;
  opened: string;
  owner: string;
  timeline: CaseEvent[];
  checklist: { id: string; label: string; done: boolean }[];
  evidence: EvidenceItem[];
}

export interface CaseEvent {
  id: string;
  at: string;
  kind: "event" | "action" | "artifact";
  text: string;
  actor: string;
}

export interface Hypothesis {
  id: string;
  text: string;
  column: "hypothesis" | "investigating" | "confirmed" | "ruled-out";
  evidence: string;
}

export interface SigmaRule {
  id: string;
  title: string;
  status: "draft" | "testing" | "deployed";
  techniqueId: string;
  fromOffensive: boolean;
  yaml: string;
  testHits: number;
}

export interface MonitoredAsset {
  id: string;
  name: string;
  health: "healthy" | "degraded" | "down";
}
