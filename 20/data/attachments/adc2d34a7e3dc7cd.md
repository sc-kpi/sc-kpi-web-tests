# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Скидання пароля
      - generic [ref=e7]: Введіть новий пароль
    - generic [ref=e9]:
      - alert [ref=e10]: Недійсний або прострочений токен скидання
      - generic [ref=e11]:
        - generic [ref=e12]: Новий пароль
        - textbox "Новий пароль" [ref=e13]: E2EResetPass123!
      - generic [ref=e14]:
        - generic [ref=e15]: Підтвердити новий пароль
        - textbox "Підтвердити новий пароль" [ref=e16]: E2EResetPass123!
      - button "Скинути пароль" [ref=e17]
  - alert [ref=e18]
```