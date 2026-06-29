// Общие UI-примитивы Legal Hub.
// Состояния (:hover/:focus/:active) заданы CSS-классами в globals.css (.ui-*).
// Все цвета — через токены дизайн-системы, поэтому light/dark переключаются сами.

import { Fragment, Children, isValidElement, useState, useRef, useEffect } from "react";
import type {
  ButtonHTMLAttributes,
  ReactNode,
  CSSProperties,
} from "react";

/** Маленький помощник для склейки классов (без зависимости на clsx). */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ===================== Button ===================== */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "negative";
type ControlSize = "xs" | "s" | "m" | "l";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Иконка слева от текста */
  icon?: ReactNode;
  /** Иконка справа от текста */
  iconRight?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "m",
  icon,
  iconRight,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("ui-btn", `ui-btn--${variant}`, `ui-btn--${size}`, className)}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

/* ===================== IconButton ===================== */

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Обязательная подпись для доступности; по умолчанию идёт и в title */
  label: string;
  danger?: boolean;
  size?: number;
}

export function IconButton({
  label,
  danger,
  size = 32,
  className,
  children,
  type = "button",
  title,
  style,
  ...rest
}: IconButtonProps) {
  const dim: CSSProperties = { width: size, height: size };
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cx("ui-iconbtn", danger && "ui-iconbtn--danger", className)}
      style={{ ...dim, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ===================== LinkButton ===================== */

interface LinkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function LinkButton({
  icon,
  iconRight,
  className,
  children,
  type = "button",
  ...rest
}: LinkButtonProps) {
  return (
    <button type={type} className={cx("ui-linkbtn", className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

/* ===================== Select ===================== */

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options?: SelectOption[];
  value?: string | number;
  /** Совместимо с нативным select: вызывается с { target: { value } } */
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  /** Можно передавать <option>…</option> детьми вместо options */
  children?: ReactNode;
}

/** Превращает текстовое содержимое узла в строку (для лейблов <option>). */
function nodeToText(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) return nodeToText((node.props as { children?: ReactNode }).children);
  return "";
}

/** Собирает плоский список опций из <option> детей (включая .map() и условия). */
function flattenSelectOptions(children: ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === "option") {
      const props = child.props as { value?: string | number; children?: ReactNode };
      out.push({ value: props.value ?? "", label: nodeToText(props.children) });
    } else {
      const props = child.props as { children?: ReactNode };
      if (props.children) out.push(...flattenSelectOptions(props.children));
    }
  });
  return out;
}

export function Select({
  options,
  value,
  onChange,
  disabled,
  className,
  style,
  placeholder = "Выберите",
  children,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const opts = options ?? flattenSelectOptions(children);
  const cur = String(value ?? "");
  const selected = opts.find((o) => String(o.value) === cur);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = (v: string | number) => {
    setOpen(false);
    onChange?.({ target: { value: String(v) } });
  };

  return (
    <div ref={ref} className="ui-select-wrap" style={style}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cx("ui-select", open && "ui-select--open", className)}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: selected && selected.value !== "" ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{
            flexShrink: 0,
            color: "var(--color-icons-secondary)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform var(--duration-fast) var(--ease-standard)",
          }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="ui-select-panel" role="listbox">
          {opts.map((o) => {
            const sel = String(o.value) === cur;
            return (
              <div
                key={String(o.value)}
                role="option"
                aria-selected={sel}
                className="ui-select-opt"
                onClick={() => pick(o.value)}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
                {sel && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: "var(--color-brand)" }}>
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===================== Badge ===================== */

type BadgeTone = "neutral" | "brand" | "positive" | "warning" | "negative";

const BADGE_TONE: Record<BadgeTone, CSSProperties> = {
  neutral: { background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
  brand: { background: "var(--color-accent-brand-bg)", color: "var(--color-text-brand)" },
  positive: { background: "var(--color-accent-positive-bg)", color: "var(--color-accent-positive)" },
  warning: { background: "var(--color-accent-warning-bg)", color: "var(--color-text-primary)" },
  negative: { background: "var(--color-accent-negative-bg)", color: "var(--color-accent-negative)" },
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  style?: CSSProperties;
}

/* ===================== PageHeader ===================== */

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  /** Хлебные крошки: элементы с onClick → ссылки, последний без onClick → текущая страница */
  crumbs?: Breadcrumb[];
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Кнопки справа от заголовка */
  actions?: ReactNode;
  titleSize?: number;
}

export function PageHeader({ crumbs, title, subtitle, actions, titleSize = 24 }: PageHeaderProps) {
  return (
    <div>
      {crumbs && crumbs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
          {crumbs.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <span style={{ color: "var(--color-text-tertiary)" }}>›</span>}
              {c.onClick ? (
                <LinkButton style={{ fontSize: "14px" }} onClick={c.onClick}>{c.label}</LinkButton>
              ) : (
                <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>{c.label}</span>
              )}
            </Fragment>
          ))}
        </div>
      )}
      {(title || actions) && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "28px" }}>
          <div>
            {title && (
              <h1 style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: `${titleSize}px`, color: "var(--color-text-primary)", margin: 0 }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-secondary)", margin: "6px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ flexShrink: 0, display: "flex", gap: "8px" }}>{actions}</div>}
        </div>
      )}
    </div>
  );
}

/* ===================== Badge ===================== */

export function Badge({ tone = "neutral", children, icon, style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "var(--radius-s)",
        fontFamily: "MTS Compact, sans-serif",
        fontSize: "11px",
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...BADGE_TONE[tone],
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/* ===================== SegmentedControl ===================== */

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "s" | "m";
  fullWidth?: boolean;
  style?: CSSProperties;
}

export function SegmentedControl({ segments, value, onChange, size = "m", fullWidth, style }: SegmentedControlProps) {
  const heights = { s: 36, m: 44 };
  const pad = { s: 3, m: 4 };
  return (
    <div
      style={{
        display: "inline-flex",
        gap: "2px",
        padding: `${pad[size]}px`,
        background: "var(--color-background-secondary)",
        borderRadius: "var(--radius-m)",
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            style={{
              flex: fullWidth ? 1 : undefined,
              height: heights[size] - pad[size] * 2,
              padding: "0 16px",
              border: "none",
              borderRadius: "calc(var(--radius-m) - 3px)",
              background: active ? "var(--color-background-primary)" : "transparent",
              boxShadow: active ? "var(--shadow-low)" : "none",
              color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              fontFamily: "MTS Compact, sans-serif",
              fontSize: "14px",
              fontWeight: active ? 500 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ===================== Checkbox ===================== */

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Checkbox({ checked, onChange, label, disabled, style }: CheckboxProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "MTS Compact, sans-serif",
        fontSize: "14px",
        color: disabled ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
        ...style,
      }}
    >
      <span
        onClick={() => !disabled && onChange(!checked)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          flexShrink: 0,
          borderRadius: "var(--radius-s)",
          background: checked ? "var(--brand-blue)" : "transparent",
          border: checked ? "1px solid transparent" : "1px solid var(--color-control-stroke)",
          transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
        }}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
