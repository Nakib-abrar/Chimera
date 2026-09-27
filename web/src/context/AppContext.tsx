import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Approval,
  ChatMessage,
  ChatMode,
  FontScale,
  Profile,
  Theme,
} from "@/lib/types";
import {
  approvals as seedApprovals,
  chatSeed,
  defensiveChatSeed,
  engagements,
} from "@/data/mock";

/* Safe localStorage — 3.2 / 9.x (wrapped so private mode never breaks render) */
function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;

  profile: Profile;
  setProfile: (p: Profile) => void;

  authed: boolean;
  signIn: () => void;
  signOut: () => void;

  providerConfigured: boolean;
  setProviderConfigured: (v: boolean) => void;

  navPinned: boolean;
  setNavPinned: (v: boolean) => void;

  activeEngagementId: string;
  setActiveEngagementId: (id: string) => void;

  chatMode: ChatMode;
  setChatMode: (m: ChatMode) => void;
  railView: "chat" | "output";
  setRailView: (v: "chat" | "output") => void;

  messages: ChatMessage[];
  sendMessage: (text: string) => void;

  approvals: Approval[];
  resolveApproval: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readLS<Theme>("chimera.theme", "dark"));
  const [fontScale, setFontScaleState] = useState<FontScale>(() =>
    readLS<FontScale>("chimera.fontScale", "default"),
  );
  const [profile, setProfileState] = useState<Profile>("neutral");
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("chimera.authed") === "1";
    } catch {
      return false;
    }
  });
  const [providerConfigured, setProviderConfiguredState] = useState<boolean>(() =>
    readLS<boolean>("chimera.providerConfigured", true),
  );
  const [navPinned, setNavPinnedState] = useState<boolean>(() =>
    readLS<boolean>("chimera.navPinned", false),
  );
  const [activeEngagementId, setActiveEngagementId] = useState<string>(engagements[0].id);
  const [chatMode, setChatMode] = useState<ChatMode>("agent");
  const [railView, setRailView] = useState<"chat" | "output">("chat");
  const [chatByProfile, setChatByProfile] = useState<Record<"offensive" | "defensive", ChatMessage[]>>({
    offensive: chatSeed,
    defensive: defensiveChatSeed,
  });
  const [approvals, setApprovals] = useState<Approval[]>(seedApprovals);
  const activeChatKey: "offensive" | "defensive" = profile === "defensive" ? "defensive" : "offensive";
  const messages = chatByProfile[activeChatKey];

  /* Sync theme + font-scale to <html>; profile is applied per-shell so platform
     screens stay neutral. */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeLS("chimera.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-scale", fontScale);
    writeLS("chimera.fontScale", fontScale);
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.setAttribute("data-profile", profile);
  }, [profile]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );
  const setFontScale = useCallback((s: FontScale) => setFontScaleState(s), []);
  const setProfile = useCallback((p: Profile) => setProfileState(p), []);
  const setProviderConfigured = useCallback((v: boolean) => {
    setProviderConfiguredState(v);
    writeLS("chimera.providerConfigured", v);
  }, []);
  const setNavPinned = useCallback((v: boolean) => {
    setNavPinnedState(v);
    writeLS("chimera.navPinned", v);
  }, []);

  const signIn = useCallback(() => {
    setAuthed(true);
    try {
      sessionStorage.setItem("chimera.authed", "1");
    } catch {
      /* ignore */
    }
  }, []);
  const signOut = useCallback(() => {
    setAuthed(false);
    setProfileState("neutral");
    try {
      sessionStorage.removeItem("chimera.authed");
    } catch {
      /* ignore */
    }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const now = new Date();
      const at = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
      setChatByProfile((prev) => ({
        ...prev,
        [activeChatKey]: [
          ...prev[activeChatKey],
          { id: `msg-${Date.now()}`, author: "operator", text: trimmed, at },
          {
            id: `msg-${Date.now() + 1}`,
            author: "agent",
            text:
              chatMode === "ask"
                ? "In Ask mode I won't execute anything. Here's my read on that, based on the current context."
                : "Understood. I'll plan the steps and pause for approval before any sensitive action.",
            at,
          },
        ],
      }));
    },
    [chatMode, activeChatKey],
  );

  const resolveApproval = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      fontScale,
      setFontScale,
      profile,
      setProfile,
      authed,
      signIn,
      signOut,
      providerConfigured,
      setProviderConfigured,
      navPinned,
      setNavPinned,
      activeEngagementId,
      setActiveEngagementId,
      chatMode,
      setChatMode,
      railView,
      setRailView,
      messages,
      sendMessage,
      approvals,
      resolveApproval,
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      fontScale,
      setFontScale,
      profile,
      setProfile,
      authed,
      signIn,
      signOut,
      providerConfigured,
      setProviderConfigured,
      navPinned,
      setNavPinned,
      activeEngagementId,
      chatMode,
      railView,
      messages,
      sendMessage,
      approvals,
      resolveApproval,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
