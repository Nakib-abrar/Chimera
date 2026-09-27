import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { LeftNav } from "./LeftNav";
import { TopBar } from "./TopBar";
import { RightRail } from "./RightRail";
import { ProfileSwitcher } from "./ProfileSwitcher";
import s from "./shell.module.css";

export function Shell({ profile }: { profile: "offensive" | "defensive" }) {
  const { setProfile } = useApp();
  const [railOpen, setRailOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    setProfile(profile);
  }, [profile, setProfile]);

  return (
    <div className={s.shell} data-profile={profile}>
      <div className={s.top}>
        <TopBar
          profile={profile}
          onOpenSwitcher={() => setSwitcherOpen(true)}
          onToggleRail={() => setRailOpen((v) => !v)}
        />
      </div>
      <div className={s.navArea}>
        <LeftNav profile={profile} />
      </div>
      <main className={s.center}>
        <Outlet />
      </main>
      <RightRail open={railOpen} onClose={() => setRailOpen(false)} />
      <ProfileSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} current={profile} />
    </div>
  );
}
