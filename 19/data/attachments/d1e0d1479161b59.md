# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Увійти" [level=3] [ref=e6]
      - generic [ref=e7]: Увійдіть у свій акаунт
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Електронна пошта
        - textbox "Електронна пошта" [ref=e12]
      - generic [ref=e13]:
        - generic [ref=e14]: Пароль
        - textbox "Пароль" [ref=e15]
      - link "Забули пароль?" [ref=e17] [cursor=pointer]:
        - /url: /forgot-password
      - button "Увійти" [ref=e18]
      - generic [ref=e23]: або продовжити з
      - button "Продовжити з Google" [ref=e24]:
        - img
        - text: Продовжити з Google
      - paragraph [ref=e25]:
        - text: Немає акаунту?
        - link "Реєстрація" [ref=e26] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
  - alert [ref=e27]
```