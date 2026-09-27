import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ToastProvider } from "@/components/ui";
import { Shell } from "@/components/shell/Shell";

import { SignIn } from "@/screens/platform/SignIn";
import { Settings } from "@/screens/platform/Settings";
import { ProfileLanding } from "@/screens/platform/ProfileLanding";

import { EngagementLauncher } from "@/screens/offensive/EngagementLauncher";
import { LiveOpsConsole } from "@/screens/offensive/LiveOpsConsole";
import { TargetOverview } from "@/screens/offensive/TargetOverview";
import { ThreatMap } from "@/screens/offensive/ThreatMap";
import { FindingsEvidence } from "@/screens/offensive/FindingsEvidence";
import { ApprovalQueue } from "@/screens/offensive/ApprovalQueue";
import { ReportStudio } from "@/screens/offensive/ReportStudio";
import { OffensiveSkills, DefensiveSkills } from "@/screens/shared/SkillsTools";

import { SecurityOpsOverview } from "@/screens/defensive/SecurityOpsOverview";
import { AlertTriage } from "@/screens/defensive/AlertTriage";
import { ThreatHunting } from "@/screens/defensive/ThreatHunting";
import { CasesIR } from "@/screens/defensive/CasesIR";
import { DetectionEngineering } from "@/screens/defensive/DetectionEngineering";
import { CoverageMap } from "@/screens/defensive/CoverageMap";

import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useApp();
  if (!authed) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

export default function App() {
  const { authed } = useApp();

  return (
    <ToastProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/launch" element={<RequireAuth><ProfileLanding /></RequireAuth>} />

        <Route path="/offensive" element={<RequireAuth><Shell profile="offensive" /></RequireAuth>}>
          <Route index element={<Navigate to="console" replace />} />
          <Route path="engagements" element={<EngagementLauncher />} />
          <Route path="console" element={<LiveOpsConsole />} />
          <Route path="targets" element={<TargetOverview />} />
          <Route path="threat-map" element={<ThreatMap />} />
          <Route path="findings" element={<FindingsEvidence />} />
          <Route path="approvals" element={<ApprovalQueue />} />
          <Route path="report" element={<ReportStudio />} />
          <Route path="skills" element={<OffensiveSkills />} />
        </Route>

        <Route path="/defensive" element={<RequireAuth><Shell profile="defensive" /></RequireAuth>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<SecurityOpsOverview />} />
          <Route path="triage" element={<AlertTriage />} />
          <Route path="hunting" element={<ThreatHunting />} />
          <Route path="cases" element={<CasesIR />} />
          <Route path="detection" element={<DetectionEngineering />} />
          <Route path="coverage" element={<CoverageMap />} />
          <Route path="skills" element={<DefensiveSkills />} />
        </Route>

        <Route path="/" element={<Navigate to={authed ? "/launch" : "/signin"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
