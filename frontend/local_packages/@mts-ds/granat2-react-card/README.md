# Card

---

### Реализован компонент Card.

Компонент карточка.

---

### Props

- `size: CardSize;`
- `children: ReactNode`
- `fluid? : CardFluid`
- `variant: CardVariant;`
- `cornerRadius?: number;`
- `onMouseEnter?: (event)=>void;`
- `onMouseLeave?: (event)=>void;`
- `onClick?: (event)=>void;`

### Types

- `type CardSize = 's' | 'm' | 'mobile';`
- `type CardVariant = 'default' | 'no-shadow' | 'grey' | 'outlined' | 'transparent' | 'transparent-blurred';`
- `type CardFluid = 'true' | 'false' | 'width' | 'height'';`

Пример использования

```html

<Card
  size={'m'}
  variant="default"
  fluid="width"
  cornerRadius=5
>
  {children}
</Card>
```
