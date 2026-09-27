import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui";
import { ChimeraMark } from "@/components/shell/ChimeraMark";
import s from "./platform.module.css";
import ui from "@/components/ui/ui.module.css";

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useApp();
  const [secret, setSecret] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Single shared secret gates the GUI (§1). Demo accepts any non-empty value.
    if (secret.trim().length < 3) {
      setError(true);
      return;
    }
    signIn();
    navigate("/launch");
  };

  return (
    <div className={s.signin}>
      <form className={s.signinCard} onSubmit={submit}>
        <ChimeraMark size={44} />
        <div className="col center" style={{ gap: 4 }}>
          <h1 className="t-display-md">Chimera</h1>
          <p className="t-caption">Self-hosted · single operator</p>
        </div>
        <div className={ui.field} style={{ width: "100%" }}>
          <label className={ui.label} htmlFor="secret">Shared secret</label>
          <div className={ui.inputWrap}>
            <input
              id="secret"
              type={show ? "text" : "password"}
              className={`${ui.input} ${ui["input--mono"]} ${error ? ui["input--error"] : ""}`}
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setError(false);
              }}
              placeholder="Enter operator secret"
              autoFocus
              autoComplete="off"
            />
            <button type="button" className={ui.revealBtn} onClick={() => setShow((v) => !v)} aria-label={show ? "Hide" : "Show"}>
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {error && <span className={ui.help} style={{ color: "var(--negative)" }}>That secret was not accepted. Try again.</span>}
        </div>
        <Button type="submit" variant="primary" block pill icon={<Lock size={16} />}>
          Unlock console
        </Button>
      </form>
    </div>
  );
}
