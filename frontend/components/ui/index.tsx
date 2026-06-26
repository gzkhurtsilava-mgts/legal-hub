// Общие UI-примитивы Legal Hub.
// Состояния (:hover/:focus/:active) заданы CSS-классами в globals.css (.ui-*).
// Все цвета — через токены дизайн-системы, поэтому light/dark переключаются сами.

import type {
  ButtonHTMLAttributes,
  SelectHTMLAttributes,
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
  size = "s",
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

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
}

export function Select({ options, className, children, style, ...rest }: SelectProps) {
  return (
    <div className="ui-select-wrap" style={style}>
      <select className={cx("ui-select", className)} {...rest}>
        {options
          ? options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : children}
      </select>
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
