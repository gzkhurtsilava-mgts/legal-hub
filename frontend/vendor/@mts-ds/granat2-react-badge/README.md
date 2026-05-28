Badge
===
---
#### Реализован компонент Badge. 
Бейдж бывает серым и акцентным. В акцентном варианте можно менять цвета на другие в рамках дизайн системы

---
### Props

 - backgroundColor: string -
   Цвет из дизайн-системы. Можно задавать как **camelCase PascalCase SnackCase итд**.  **Если не указывать цвет, то бейдж будет серым!!!** 
 - size: 'xs' | 's' | 'm' | 'l'
 - textColor: 'primary' | 'secondary' | 'light'

### Бейдж без иконки

```html
<Badge color="color-accent-active" size="m">Badge</Badge>
```

### Бейдж с иконкой

```html
  <Badge color="color-accent-active" size="m">
    <BadgeIcon>
      <IconStar />
    </BadgeIcon>
    Badge
  </Badge>
```

---
Иконка должна быть обернута в компонент
```html
 <BadgeIcon>
      <IconStar />
 </BadgeIcon>
```
---
