import { useEffect, useRef, useState } from "react";
import {
  AtSign,
  Check,
  ChevronRight,
  History,
  MessageSquare,
  Send,
  ShieldAlert,
  Terminal,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { ChatMessage, ChatMode, ToolCall } from "@/lib/types";
import { Button, SegmentedControl, StatusDot } from "@/components/ui";
import { ChimeraMark } from "./ChimeraMark";
import s from "./shell.module.css";

const MODE_CAPTION: Record<ChatMode, string> = {
  agent: "Agent runs autonomously and pauses for approval on sensitive actions.",
  manual: "Manual shows every tool command editable before it runs.",
  ask: "Ask answers questions only — nothing is executed.",
};

function ToolCallCard({ call, subagent }: { call: ToolCall; subagent?: string }) {
  const [open, setOpen] = useState(call.status !== "done");
  const statusColor =
    call.status === "done"
      ? "var(--positive)"
      : call.status === "error"
        ? "var(--negative)"
        : call.status === "pending-approval"
          ? "var(--warning)"
          : "var(--accent)";
  return (
    <div className={`${s.toolCard} ${subagent ? s.toolCardNested : ""}`}>
      <div className={s.toolCardHead} onClick={() => setOpen((v) => !v)} role="button" tabIndex={0}>
        <ChevronRight size={14} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 120ms", color: "var(--mute)", flex: "none" }} />
        <Terminal size={14} style={{ color: "var(--mute)", flex: "none" }} />
        <span className={s.toolCmd}>{call.command}</span>
        <span className={s.pillDot} style={{ background: statusColor }} title={call.status} />
      </div>
      {open && call.output && <div className={s.toolOut}>{call.output}</div>}
      {open && call.summary && <div className={s.toolSummary}>{call.summary}</div>}
      {call.status === "pending-approval" && (
        <div className={s.toolSummary} style={{ color: "var(--warning)" }}>
          Awaiting approval — see the inline card below.
        </div>
      )}
    </div>
  );
}

function MessageView({ m }: { m: ChatMessage }) {
  const { approvals, resolveApproval } = useApp();
  if (m.author === "operator") {
    return <div className={s.msgOperator}>{m.text}</div>;
  }
  if (m.author === "system") {
    return (
      <div className={s.msgSystem}>
        <Check size={12} style={{ color: "var(--positive)" }} />
        {m.checkpoint?.label}
        <button className={s.rollback}>· Rollback to here</button>
      </div>
    );
  }
  const approval = m.approval ? approvals.find((a) => a.id === m.approval) : undefined;
  return (
    <div className={s.msgAgent}>
      {m.subagent && (
        <div className={s.msgAgentAuthor}>
          <StatusDot status="running-tool" />
          <span className="t-caption" style={{ color: "var(--accent)", fontWeight: 600 }}>{m.subagent}</span>
        </div>
      )}
      {m.text && <div>{m.text}</div>}
      {m.toolCall && <ToolCallCard call={m.toolCall} subagent={m.subagent} />}
      {approval && (
        <div className={s.approvalInline}>
          <div className="row gap-sm">
            <ShieldAlert size={16} style={{ color: "var(--warning)" }} />
            <span className="t-body-sm-strong">Approval required · {approval.intent}</span>
          </div>
          <div className="t-mono-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--body)", wordBreak: "break-all" }}>
            {approval.command}
          </div>
          <div className="row gap-sm">
            <Button size="sm" variant="primary" onClick={() => resolveApproval(approval.id)}>Approve</Button>
            <Button size="sm" variant="danger" onClick={() => resolveApproval(approval.id)}>Deny</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RightRail({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { chatMode, setChatMode, railView, setRailView, messages, sendMessage } = useApp();
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(380);
  const [chips, setChips] = useState<string[]>(["@scope.yaml"]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const resizing = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const submit = () => {
    sendMessage(draft);
    setDraft("");
  };

  const onResizeDown = (e: React.PointerEvent) => {
    resizing.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizing.current) return;
    const w = Math.max(320, Math.min(520, window.innerWidth - e.clientX));
    setWidth(w);
  };
  const onResizeUp = () => {
    resizing.current = false;
  };

  if (collapsed) {
    return (
      <div className={s.railCollapsed}>
        <button className={s.railTab} onClick={() => setCollapsed(false)} aria-label="Expand chat">
          <MessageSquare size={18} />
        </button>
        <div className={s.railCollapsedTab}>Chat</div>
        <span className={s.pillDot} style={{ background: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <>
      <div className={s.railOverlayBackdrop} data-open={open} onClick={onClose} />
      <div className={s.railArea} data-open={open}>
        <aside className={s.rail} style={{ ["--rail-w-custom" as string]: `${width}px` }} aria-label="Chat control plane">
          <div
            className={s.railResize}
            onPointerDown={onResizeDown}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            role="separator"
            aria-label="Resize chat rail"
          />
          <div className={s.railHead}>
            <div className="row between">
              <div className={s.railTabs}>
                <button className={s.railTab} data-active={railView === "chat"} onClick={() => setRailView("chat")}>
                  <MessageSquare /> Chat
                </button>
                <button className={s.railTab} data-active={railView === "output"} onClick={() => setRailView("output")}>
                  <Terminal /> Output
                </button>
              </div>
              <div className="row gap-xs">
                <button className={s.railTab} onClick={() => setCollapsed(true)} aria-label="Collapse chat">
                  <ChevronRight />
                </button>
                <button className={`${s.railTab} ${s.railToggleBtn}`} onClick={onClose} aria-label="Close chat">
                  <X />
                </button>
              </div>
            </div>
            <SegmentedControl<ChatMode>
              block
              ariaLabel="Interaction mode"
              segments={[
                { value: "agent", label: "Agent" },
                { value: "manual", label: "Manual" },
                { value: "ask", label: "Ask" },
              ]}
              value={chatMode}
              onChange={setChatMode}
            />
            <div className={s.modeCaption}>{MODE_CAPTION[chatMode]}</div>
          </div>

          {railView === "chat" ? (
            <div className={s.messages} ref={scrollRef}>
              {messages.map((m) => (
                <MessageView key={m.id} m={m} />
              ))}
            </div>
          ) : (
            <div className={s.messages} ref={scrollRef}>
              {messages
                .filter((m) => m.toolCall)
                .map((m) => (
                  <ToolCallCard key={m.id} call={m.toolCall!} subagent={m.subagent} />
                ))}
              <div className="row gap-sm t-caption">
                <History size={13} /> Streaming raw tool output for this engagement.
              </div>
            </div>
          )}

          <div className={s.railInputWrap}>
            {chips.length > 0 && (
              <div className={s.chips}>
                {chips.map((c) => (
                  <span key={c} className={s.ctxChip}>
                    {c}
                    <button onClick={() => setChips((prev) => prev.filter((x) => x !== c))} aria-label={`Remove ${c}`}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className={s.inputRow}>
              <button className={s.railTab} onClick={() => setChips((p) => [...p, "@context"])} aria-label="Attach context">
                <AtSign size={16} />
              </button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={chatMode === "ask" ? "Ask a question…" : "Message the orchestrator…  / for commands"}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              <button className={s.sendBtn} onClick={submit} disabled={!draft.trim()} aria-label="Send">
                <Send />
              </button>
            </div>
            {draft.startsWith("/") && (
              <div className="t-caption row gap-sm">
                <ChimeraMark size={12} /> /rollback · /checkpoint
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
