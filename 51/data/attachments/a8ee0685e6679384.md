# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Двофакторна перевірка" [level=3] [ref=e6]
      - generic [ref=e7]: Введіть 6-значний код з вашого додатку автентифікації для завершення входу.
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Код підтвердження
        - textbox "Код підтвердження" [active] [ref=e12]:
          - /placeholder: "000000"
          - text: "12345"
        - paragraph [ref=e13]: Code must be at least 6 characters
      - button "Підтвердити" [ref=e14]
      - button "Використати код відновлення" [ref=e15]
  - region "Notifications alt+T"
  - alert [ref=e16]
```