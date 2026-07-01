Dropdown picker with chevron, click-outside close and brand-highlighted selection.

```jsx
<Select label="Отдел" options={[{value:'legal',label:'Юридический'},{value:'it',label:'ИТ'}]}
        value={dept} onChange={setDept} />
```

Options accept plain strings or `{value,label}`. Supports `error`, `disabled`, `size`.
