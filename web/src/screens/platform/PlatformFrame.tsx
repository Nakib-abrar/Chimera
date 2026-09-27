import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { IconButton } from "@/components/ui";
import { ChimeraMark } from "@/components/shell/ChimeraMark";
import s from "./platform.module.css";

export function PlatformFrame({ children, showSettings = true }: { children: ReactNode; showSettings?: boolean }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();
  return (
    <div className={s.frame}>
      <div className={s.frameTop}>
        <button className="row gap-sm" onClick={() => navigate("/launch")} style={{ fontWeight: 700, color: "var(--ink)", fontSize: "var(--fs-heading-md)" }}>
          <ChimeraMark />
          Chimera
        </button>
        <div className="spacer" />
        <IconButton label="Toggle theme" onClick={toggleTheme}>
          {theme === "dark" ? <Moon /> : <Sun />}
        </IconButton>
        {showSettings && (
          <IconButton label="Settings" onClick={() => navigate("/settings")}>
            <SettingsIcon />
          </IconButton>
        )}
      </div>
      <div className={s.frameBody}>{children}</div>
    </div>
  );
}
