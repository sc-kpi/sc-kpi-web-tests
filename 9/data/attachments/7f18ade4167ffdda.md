# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Увійти" [level=3] [ref=e6]
      - generic [ref=e7]: Увійдіть у свій акаунт
    - generic [ref=e9]:
      - alert [ref=e10]: Invalid email or password
      - generic [ref=e11]:
        - generic [ref=e12]: Електронна пошта
        - textbox "Електронна пошта" [ref=e13]: Tetyana_Gladkuuvsukkii@gmail.com
      - generic [ref=e14]:
        - generic [ref=e15]: Пароль
        - textbox "Пароль" [ref=e16]: xtnAGFxEQkT6
      - link "Забули пароль?" [ref=e18] [cursor=pointer]:
        - /url: /forgot-password
      - button "Увійти" [ref=e19]
      - generic [ref=e24]: або продовжити з
      - button "Продовжити з Google" [ref=e25]:
        - img
        - text: Продовжити з Google
      - paragraph [ref=e26]:
        - text: Немає акаунту?
        - link "Реєстрація" [ref=e27] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
  - alert [ref=e28]
```