import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

interface FieldProps {
  label?: string;
  help?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, help, htmlFor, children }: FieldProps) {
  return (
    <div className={s.field}>
      {label && (
        <label className={s.label} htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {help && <span className={s.help}>{help}</span>}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
  invalid?: boolean;
}

export function TextInput({ mono, invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      className={cx(s.input, mono && s["input--mono"], invalid && s["input--error"], className)}
      {...rest}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
}

export function Textarea({ mono, className, ...rest }: TextareaProps) {
  return <textarea className={cx(s.textarea, mono && s["input--mono"], className)} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <select className={cx(s.select, className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Masked secret input — never renders the value until revealed (4.2). */
export function MaskedInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  const id = useId();
  return (
    <div className={s.inputWrap}>
      <input
        id={id}
        type={shown ? "text" : "password"}
        className={cx(s.input, s["input--mono"], className)}
        autoComplete="off"
        {...rest}
      />
      <button
        type="button"
        className={s.revealBtn}
        aria-label={shown ? "Hide secret" : "Reveal secret"}
        onClick={() => setShown((v) => !v)}
      >
        {shown ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}
