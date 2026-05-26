Root
====

Корневой компонент для приложения.

Необходим для правильного функционирования компонентов Дизайн-Системы.
Обязателен к использованию.
Следует размещать как можно ближе к корню приложения.

Так же обязательно следует импортировать файлы стилей `theme.css` и `fonts.css` в приложение.
`theme.css` это реэкспорт некоторых токенов из `@mts-ds/base`.
Эти токены можно использовать в приложении, и их значения будут автоматически изменяться в зависимости от выбранной темы.

```jsx
import '@mts-ds/granat2-react-root/theme.css';
import '@mts-ds/granat2-react-root/fonts.css';
import { MtsDsRoot } from '@mts-ds/granat2-react-root';

<MtsDsRoot themeName="light">
  ...
</MtsDsRoot>
```
В случае проблем с импортом шрифтов из `fonts.css`, например в Next.js, можно заменить импорт на `fonts-alt.css`.

```jsx
import '@mts-ds/granat2-react-root/fonts-alt.css';
```