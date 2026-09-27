import { useState } from "react";
import { NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cx } from "@/lib/ui";
import { offensiveNav, defensiveNav } from "./navConfig";
import s from "./shell.module.css";

export function LeftNav({ profile }: { profile: "offensive" | "defensive" }) {
  const { navPinned, setNavPinned, approvals } = useApp();
  const [hover, setHover] = useState(false);
  const expanded = navPinned || hover;
  const items = profile === "offensive" ? offensiveNav : defensiveNav;

  const badgeValue = (key?: "approvals" | "jobs"): number | null => {
    if (key === "approvals") return approvals.length || null;
    if (key === "jobs" && profile === "offensive") return 1; // queued cron jobs (mock)
    return null;
  };

  return (
    <nav
      className={s.nav}
      data-expanded={expanded}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${profile} navigation`}
    >
      <div className={s.navItems}>
        {items.map((item) => {
          const badge = badgeValue(item.badgeKey);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => cx(s.navItem, isActive && s.navItemActive)}
            >
              {item.icon}
              <span className={s.navLabel}>{item.label}</span>
              {badge != null && <span className={s.navBadge}>{badge}</span>}
            </NavLink>
          );
        })}
      </div>
      <div className={s.navFoot}>
        <button className={s.pinBtn} onClick={() => setNavPinned(!navPinned)} aria-pressed={navPinned}>
          {navPinned ? <PanelLeftClose /> : <PanelLeftOpen />}
          <span className={s.navLabel}>{navPinned ? "Unpin nav" : "Pin nav"}</span>
        </button>
      </div>
    </nav>
  );
}
