import {
  Boxes,
  BellRing,
  ClipboardCheck,
  FileText,
  FolderGit2,
  Grid3x3,
  LayoutDashboard,
  Network,
  Radar,
  ScrollText,
  ShieldAlert,
  ShieldPlus,
  Target,
  Terminal,
} from "lucide-react";
import type { ReactNode } from "react";

export interface NavItemDef {
  to: string;
  label: string;
  icon: ReactNode;
  badgeKey?: "approvals" | "jobs";
}

export const offensiveNav: NavItemDef[] = [
  { to: "/offensive/engagements", label: "Engagements", icon: <FolderGit2 /> },
  { to: "/offensive/console", label: "Live Ops Console", icon: <Terminal /> },
  { to: "/offensive/targets", label: "Target Overview", icon: <Target /> },
  { to: "/offensive/threat-map", label: "Threat Map", icon: <Network /> },
  { to: "/offensive/findings", label: "Findings & Evidence", icon: <ShieldAlert /> },
  { to: "/offensive/approvals", label: "Approval Queue", icon: <ClipboardCheck />, badgeKey: "approvals" },
  { to: "/offensive/report", label: "Report Studio", icon: <FileText /> },
  { to: "/offensive/skills", label: "Skills & Tools", icon: <Boxes />, badgeKey: "jobs" },
];

export const defensiveNav: NavItemDef[] = [
  { to: "/defensive/overview", label: "Security Ops Overview", icon: <LayoutDashboard /> },
  { to: "/defensive/triage", label: "Alert Triage", icon: <BellRing /> },
  { to: "/defensive/hunting", label: "Threat Hunting", icon: <Radar /> },
  { to: "/defensive/cases", label: "Cases / IR", icon: <ScrollText /> },
  { to: "/defensive/detection", label: "Detection Engineering", icon: <ShieldPlus /> },
  { to: "/defensive/coverage", label: "Coverage Map", icon: <Grid3x3 /> },
  { to: "/defensive/skills", label: "Skills & Tools", icon: <Boxes /> },
];
