Badge
===
---
#### Реализован компонент Badge. 
Бейдж бывает серым и акцентным. В акцентном варианте можно менять цвета на другие в рамках дизайн системы

---
### Props

 - backgroundColor: string -
   Цвет из дизайн системы. Можно задавать как **camelCase PascalCase SnackCase итд**.  **Если не указывать цвет то бейлж будет серым!!!** 
 - size: 'xs' | 's' | 'm' | 'l'
 - textColor: 'primary' | 'secondary' | 'light'

### Бейдж без иконки

```html
<MtsBadge color="color-accent-active" size="m">Badge</MtsBadge>
```

### Бейдж с иконкой

```html
  <MtsBadge color="color-accent-active" size="m">
    <MtsBadgeIcon>
      <IconStar />
    </MtsBadgeIcon>
    Badge
  </MtsBadge>
```

---
Иконка должна быть обернута в к компонент
```html
 <MtsBadgeIcon>
      <IconStar />
 </MtsBadgeIcon>
```
---
