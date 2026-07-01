Centered dialog over a dimmed overlay; click-outside or × to close.

```jsx
<Modal open={open} onClose={close} title="Удалить документ?"
  footer={<><Button variant="ghost" onClick={close}>Отмена</Button><Button variant="negative">Удалить</Button></>}>
  Действие нельзя отменить.
</Modal>
```
