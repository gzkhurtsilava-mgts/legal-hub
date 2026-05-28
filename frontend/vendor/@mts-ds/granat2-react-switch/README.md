Switch
===
---
### Реализован компонент Switch. 
Компонент переключателя.

---
### Props

- `size: SwitchSize;`
- `checked?: boolean;`
- `defaultChecked?: boolean;`
- `disabled?: boolean;`
- `value?: string;`
- `id?: string;`
- `name?: string;`
- `onChange?: ChangeEventHandler<HTMLInputElement>;`
A11y:
- `ariaLabel?: string;`
- `ariaLabelledby?: string;`
- `ariaDescribedby?: string;`

Если необходимо управлять состоянием компонента, используется проп `checked`. Если компонент обрабатывает свое сотояние сам, используется `defaultChecked`.

### Types

- `type SwitchSize = 16 | 24 | 32;`

Пример использования
```html
<Switch
  size={24}
  name="Test"
  disabled="false"
  ariaLabel="Название"
/>
```
