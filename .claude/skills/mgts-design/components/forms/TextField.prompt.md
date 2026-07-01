Text input with top label, inline placeholder and description/error below. Border turns МГТС blue on focus, negative-orange on error.

```jsx
<TextField label="Email" placeholder="name@mgts.ru" iconLeft="MailSize24StyleOutline" />
<TextField label="Пароль" type="password" error="Неверный пароль" />
```

Props: `label`, `description`, `error`, `disabled`, `size` (s/m/l), `iconLeft`/`iconRight`.
