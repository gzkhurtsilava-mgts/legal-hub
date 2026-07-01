---
name: mgts-design
description: Use this skill to generate well-branded interfaces and assets for МГТС (MGTS), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and 49 UI components for prototyping. МГТС is the blue-rebranded variant of MTS Granat 2 — accent color is МГТС blue #008ae0 (never MTS red).
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

## Key facts
- МГТС = blue rebrand of MTS Granat 2. The brand accent is **#008ae0** (МГТС blue), used everywhere MTS would use red. Never use MTS red.
- Foundations live in `styles.css` (+ `tokens/`). Use the CSS custom properties — never hardcode hex (except `--brand-blue` as the source value).
- Fonts: MTS Wide (headings), MTS Compact (UI text), MTS Sans (long-form), MTS Text (small) — in `assets/fonts/`.
- Icons: `assets/icons/` — 178 interface-icon families. Render `<Icon name="SearchSize24StyleOutline" size={24} />`; recolor via CSS `color`. Full name list in `assets/icons/Icon.d.ts`.
- 49 components live under `components/<group>/` as `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md`. Read the `.prompt.md` for what/when + usage, and the `.d.ts` for the props contract.
- Russian-language, desktop-first (1280px+), professional corporate tone, medium density. Dark theme via `.dark` on `<html>`.

## Using this skill in Claude Code / a real codebase (production)
The component sources are plain React + CSS custom properties — no build-time dependency on this design tool.
1. **Ship the foundations.** Copy `tokens/*.css` and `assets/fonts/` into the app and import `styles.css` once at the root (it `@import`s fonts + tokens). All components read CSS variables, so this is the only global setup.
2. **Use components by reading their source.** Each `components/<group>/<Name>.jsx` is a self-contained component importing only React + the icon helper. Copy the ones you need (or the whole `components/` tree) and import them with normal ES modules:
   ```jsx
   import { Button } from './components/core/Button.jsx';
   import { TextField } from './components/forms/TextField.jsx';
   ```
   Ignore the `window.DesignSystemMGTS_656a78` / `_ds_bundle.js` runtime — that is only how the design-tool preview mounts cards. In a real app, import the `.jsx` directly.
3. **Icons.** Copy `assets/icons/` (`icon-data.js` + `Icon.jsx`). `Icon.jsx` reads the icon map; in a bundler you can change the side-effect import to `import { icons } from './icon-data.js'` if you prefer an explicit import over the `window.__MGTS_ICONS` global.
4. **Match the codebase.** If the target app already has a component library, port the *visual* tokens/styling (colors, type, radii, shadows from `tokens/`) onto its existing primitives rather than dropping these in wholesale. The brand rule (#008ae0 everywhere MTS uses red) is the thing to preserve.

### Install as an Agent Skill (so Claude Code auto-loads it)
Place this whole folder at `.claude/skills/mgts-design/` in your repo (or `~/.claude/skills/mgts-design/` for all projects). Claude Code reads `SKILL.md` automatically; then ask it e.g. *"build the settings page using the mgts-design skill"* and it will follow these rules and use the tokens/components/icons here.

## Prototypes vs production
If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets + read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
