# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Увійти
      - generic [ref=e7]: Увійдіть у свій акаунт
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Електронна пошта
        - textbox "Електронна пошта" [active] [ref=e12]: invalid-email
      - generic [ref=e13]:
        - generic [ref=e14]: Пароль
        - textbox "Пароль" [ref=e15]: short
      - button "Увійти" [ref=e16]
      - paragraph [ref=e17]:
        - text: Немає акаунту?
        - link "Реєстрація" [ref=e18] [cursor=pointer]:
          - /url: /register
  - alert [ref=e19]
```