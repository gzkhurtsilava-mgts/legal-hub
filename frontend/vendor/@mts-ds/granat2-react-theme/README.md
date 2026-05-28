Theme
=====

Компонент для управления цветовыми темами компонентов Дизайн-Системы.

Необязателен к использованию. Можно вкладывать один в другой.

```jsx
import { MtsDsTheme } from '@mts-ds/granat-react-root';

<MtsDsTheme themeName="dark">
  ...
</MtsDsTheme>
```

Можно использовать тему в своих компонентах применив хук `useTheme()`.

```jsx
import { useTheme } from '@mts-ds/granat-react-root';

function Component() {
  const { themeName } = useTheme();

  return <></>;
}
```

Есть возможность указать для какого html-элемента будет применяться управление темой.
Полезно когда нужно задать глобальную тему.
Например, при наличии порталов в корне страницы.

```jsx
<MtsDsTheme themeTarge="body">
  ...
</MtsDsTheme>
```

Внутри приложения можно использовать кастомные свойства CSS определённые в `theme.css` из `@mts-ds/granat-react-root`.
При переключении темы значения этих свойств будет обновлено автоматически.
