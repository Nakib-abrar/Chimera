# Chimera Console — Web UI

A minimalistic, premium, Penligent-inspired interface for the Chimera dual-profile
security agent platform. This workspace implements the frontend described in
`CHIMERA_UIUX_IMPLEMENTATION_PLAN.md` (design + layout spec). It is a UI slice
driven by mock data — the backend is wired separately.

## Stack

- **React 18 + TypeScript + Vite**
- **React Router** for the platform / offensive / defensive route trees
- **Plain CSS + CSS Modules** with a semantic design-token layer (no raw hex in components)
- **lucide-react** for the single line-icon set
- Custom SVG graph layer (pan / zoom / cluster / minimap) standing in for the
  Sigma.js + graphology canvas the plan calls for

## Run

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production bundle to dist/
npm run preview    # serve the built bundle
npm run typecheck  # tsc --noEmit
```

Sign in with any secret of 3+ characters (single-shared-secret gate, mocked).

## What's implemented

Design system (§2), app shell (§3), and every screen in the plan:

- **Platform (§4):** sign-in, provider-first Settings (8 sub-sections), profile launcher
- **Offensive (§5):** Engagement Launcher + scope input (3 modes + staged review),
  Live Ops Console (orchestrator tree + 5-panel tabbed workspace), Target Overview,
  Threat Map (attack-surface + attack-chain), Findings & Evidence, Approval Queue,
  Report Studio (4 steps), Skills & Tools
- **Defensive (§6):** Security Ops Overview (KPIs + ATT&CK heatmap), Alert Triage,
  Threat Hunting (hypothesis board), Case / IR (timeline + IR checklist + blast radius),
  Detection Engineering (Sigma editor + Purple-Team draft queue), Coverage Map, Skills & Tools
- **Shared (§7):** chat control plane (Agent / Manual / Ask), Skill Import wizard,
  Meta-Agent builder, evidence component, checkpoints
- **Cross-cutting (§9):** responsive down to 360px, dark + light themes, font-scale,
  reduced-motion, distinct severity icon shapes, keyboard-reachable controls

### The profile-identity guarantee (§9.6)

The active profile tints one accent token that cascades to every component:
Offensive = lime, Defensive = cyan, platform screens = neutral sage. Switching
profiles is a deliberate, felt transition with a save-and-cold-start checklist.

## Structure

```
src/
  styles/        tokens.css (both themes + accent aliasing), base.css
  context/       AppContext (theme, font-scale, profile, auth, chat, approvals)
  data/          mock.ts, types
  components/
    ui/          the component library (§8) — one shared CSS module
    shell/       TopBar, LeftNav, RightRail, ProfileSwitcher, Shell, Screen
    graph/       GraphCanvas (shared by Threat Map, Coverage Map, Orchestrator Canvas)
  screens/
    platform/    SignIn, Settings, ProfileLanding
    offensive/   the 8 offensive screens
    defensive/   the defensive screens
    shared/      SkillsTools, SkillImportWizard, MetaAgentBuilder
```
