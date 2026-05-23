# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Двофакторна перевірка" [level=3] [ref=e6]
      - generic [ref=e7]: Введіть 6-значний код з вашого додатку автентифікації для завершення входу.
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Код підтвердження
        - textbox "Код підтвердження" [ref=e12]:
          - /placeholder: "000000"
      - button "Підтвердити" [ref=e13]
      - button "Використати код відновлення" [ref=e14]
  - region "Notifications alt+T"
  - alert [ref=e15]
```