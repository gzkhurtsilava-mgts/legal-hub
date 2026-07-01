Primary call-to-action button in МГТС blue — use for the main action in any view; pair with `secondary`/`ghost` for lower-emphasis actions.

```jsx
<Button variant="primary" size="m" iconLeft="PlusSize24StyleOutline">Добавить</Button>
<Button variant="secondary">Отмена</Button>
<Button variant="ghost" size="s">Подробнее</Button>
```

Variants: `primary` (blue fill), `secondary` (blue outline), `ghost` (text only), `negative` (destructive). Sizes: `xs` 28 · `s` 36 · `m` 44 (default) · `l` 52. Props: `iconLeft`/`iconRight` (icon names), `fullWidth`, `disabled`.
