// Общие UI-примитивы Legal Hub.
// Состояния (:hover/:focus/:active) заданы CSS-классами в globals.css (.ui-*).
// Все цвета — через токены дизайн-системы, поэтому light/dark переключаются сами.

import { Fragment } from "react";
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
