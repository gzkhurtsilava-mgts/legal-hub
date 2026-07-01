# МГТС Design System

Design system for **МГТС** (Московская городская телефонная сеть) — a subsidiary of MTS. It is a rebrand of **MTS Granat 2** (`mts-ds`): the same foundations, tokens and component architecture, with the defining change that **the MTS red (`#e30611` / `#ff0032`) is replaced by МГТС blue `#008ae0`** in every accent role (primary buttons, active states, links, indicators, badges).

Audience: МГТС employees (~2000), with the legal department (юридический отдел, 22–27 people) as the primary product user. Interface is **desktop-only (1280px+)**, **Russian**, professional/corporate tone.

---

## CONTENT FUNDAMENTALS

- **Language:** Russian only. UI copy, labels, statuses, placeholders — all in Russian.
- **Tone:** professional, corporate, calm — *не кричащий* (never shouty). Informative over playful.
- **Address:** neutral/impersonal or polite plural. Avoid casual «ты». Labels are short noun phrases (\"Документы\", \"На проверке\", \"Новый документ\").
- **Casing:** sentence case everywhere. No ALL-CAPS in UI. Buttons use sentence case: \"Создать\", \"Экспорт\", \"Пригласить\".
- **Microcopy examples:** statuses — «Согласован», «На проверке», «Отклонён», «Черновик»; actions — «Новый документ», «Экспорт», «Отмена», «Удалить»; helper/error — «Неверный пароль», «Превышен размер файла».
- **Emoji:** none. The brand does not use emoji in product UI.
- **Numbers/dates:** Russian formats — dates `DD.MM.YYYY`, document numbers like «№ 2024-118».

---

## VISUAL FOUNDATIONS

- **Color:** restrained, surface-driven. White/grey surfaces (`#ffffff` cards, `#f2f3f7` sections, `#e9ecf0` page) with graphite text (`#1d2023`). Color is used sparingly and meaningfully: МГТС blue `#008ae0` for the single primary action and active state; green/yellow/orange only for status. **No gradients, no decorative color washes.**
- **Brand blue stays constant in light and dark themes**; surfaces and text invert via `.dark` on `<html>`.
- **Type:** four MTS families. *MTS Wide* (700/500) for display headings H1–H2 and accent labels; *MTS Compact* (400/500/700) for all interface text and titles; *MTS Sans* for long-form description paragraphs; *MTS Text* for the smallest helper text. Family names MUST include the space: `'MTS Wide'`, `'MTS Compact'`, `'MTS Sans'`, `'MTS Text'`.
- **Spacing:** 4px base grid (4 → 64). Density is medium — comfortable but not wasteful.
- **Radii (strict token grid):** 8 (`s`, small elements/tags/checkbox) · 12 (`m`, cards/inputs/buttons) · 32 (`l`, large cards/modals) · 80 (`xl`, pills/avatars). Never use off-grid radii.
- **Borders:** hairline `1px` in `--color-line` (#e2e5eb); control strokes in `--color-control-stroke` (#969fa8), turning blue on focus.
- **Shadows:** three soft, neutral elevations — `--shadow-low` (cards), `--shadow-middle` (dropdowns/tooltips), `--shadow-high` (modals). Low-contrast, cool grey, never colored.
- **Cards:** white surface, `radius-m`/`radius-l`, `shadow-low` or hairline border, 16–24px padding. No colored left-border accents.
- **Buttons:** primary = solid blue + white text; secondary = blue outline; ghost = text only; negative = orange. Sizes 28/36/44(default)/52.
- **Animation:** subtle and functional only — fades and small transforms; `--ease-standard` cubic-bezier(0.4,0,0.2,1). No bounces, no infinite/decorative loops.
- **Tooltips:** dark graphite surface, white text, `radius-s`, `shadow-middle`.

---

## ICONOGRAPHY

- **Format:** `<Icon name="SearchSize24StyleOutline" size={24} />` — single-color, recolor via CSS `color`.
- **Naming:** `<Name>Size<NN>Style<Outline|Fill>`. Default UI size is 24, outline style.
- **Key icons for legal portal:** Search, Document, Folder, Folders, Checklist, Gavel, Edit, Delete, Filter, Download, Upload, Calendar, Settings, CheckCircle, WarningCircle, InfoCircle, Plus, ArrowRight, ArrowLeft, More, Menu, Bookmark, Star.
- Full name list in `assets/icons/Icon.d.ts`.

---

## INDEX / MANIFEST

**Foundations**
- `styles.css` — global entry (import this one file). `@import`s everything below.
- `tokens/fonts.css` — @font-face for MTS Wide / Compact / Sans / Text.
- `tokens/colors.css` — palette, semantic tokens, dark theme.
- `tokens/typography.css` — families, weights, type scale.
- `tokens/spacing.css` — spacing, radii, shadows, control heights, motion.

**Components** — 49 components
- `components/brand/` — Logo
- `components/core/` — Button, ButtonPrice, IconButton, Link, Chip, SegmentedControl, Spinner
- `components/forms/` — TextField, Textarea, Select, Checkbox, Radio, Switch, Slider, RangeSlider, Stepper, SearchInput, CodeInput, Autocomplete, FileUpload, InlineEdit, FormChip
- `components/data-display/` — Card, Badge, Tag, Avatar, Divider, Counter, ListItem, TextList
- `components/feedback/` — Tooltip, Toast, Snackbar, Modal, Banner, StickyBanner, CookieBanner, ProgressBar, Skeleton
- `components/navigation/` — Tabs, SidebarNav, Breadcrumbs, Pagination, Collapsible, Steps, Menu, ActionBar

Each component has:
- `<Name>.d.ts` — TypeScript props contract
- `<Name>.prompt.md` — usage guide with examples

---

## CSS TOKENS QUICK REFERENCE

```css
/* Brand */
--brand-blue: #008ae0
--color-brand: #008ae0
--color-brand-hover: #0072bd
--color-brand-active: #005c99
--color-brand-subtle: #e6f4fc

/* Backgrounds */
--color-background-primary: #ffffff
--color-background-secondary: #f2f3f7
--color-background-lower: #e9ecf0
--color-background-inverted: #1d2023

/* Text */
--color-text-primary: #1d2023
--color-text-secondary: #626c77
--color-text-tertiary: #969fa8
--color-text-inverted: #fafafa
--color-text-brand: #008ae0

/* Icons */
--color-icons-primary: #1d2023
--color-icons-secondary: #8d969f

/* Borders */
--color-line: #e2e5eb
--color-control-stroke: #969fa8

/* Accents */
--color-accent-positive: #26cd58
--color-accent-warning: #fac031
--color-accent-negative: #f95721

/* Accent backgrounds */
--color-accent-positive-bg: #e3f9ea
--color-accent-warning-bg: #fff4d6
--color-accent-negative-bg: #ffe5dc
--color-accent-brand-bg: #e6f4fc

/* Elevation */
--shadow-low: 0 2px 8px rgba(29,32,35,.08), 0 0 1px rgba(29,32,35,.12)
--shadow-middle: 0 4px 16px rgba(29,32,35,.12), 0 0 1px rgba(29,32,35,.12)
--shadow-high: 0 12px 40px rgba(29,32,35,.18), 0 0 1px rgba(29,32,35,.12)

/* Radii */
--radius-s: 8px
--radius-m: 12px
--radius-l: 32px
--radius-xl: 80px

/* Spacing */
--space-4: 4px  --space-8: 8px  --space-12: 12px  --space-16: 16px
--space-20: 20px  --space-24: 24px  --space-32: 32px  --space-40: 40px

/* Control heights */
--control-xs: 28px  --control-s: 36px  --control-m: 44px  --control-l: 52px

/* Type scale */
--type-h1-size: 32px / 36px  (MTS Wide 700)
--type-h2-size: 24px / 28px  (MTS Wide 700)
--type-h3-size: 20px / 24px  (MTS Compact 700)
--type-h4-size: 17px / 24px  (MTS Compact 500)
--type-body-lg-size: 17px / 24px
--type-body-size: 15px / 20px
--type-body-sm-size: 14px / 20px
--type-caption-size: 12px / 16px
```
