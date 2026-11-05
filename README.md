# Heskuchai - WordPress portfolio projects

Публікація GitHub Pages: [портфоліо](https://heskuchai.github.io/heskuchai-web-lab/)


WordPress-плагін: `[opora_studio]`. Встановлення: `build/opora-studio-wordpress.zip`. Шаблон: `wordpress/opora-studio/page.html`, стилі й поведінка: `assets/`, SVG-моделі: `projects/opora/models.py`. Після змін запустіть `python build.py`. Дані калькулятора зберігаються у браузері.

## GitHub Pages і WordPress

`docs/` - публічні статичні демонстрації. BRUTAL зберігає лише дату/час/послугу в localStorage, без імені та телефону. Stockroom зберігає демотовари в localStorage. Дані окремі для кожного браузера, не синхронізуються, можуть бути очищені браузером. Це не публічний WordPress-сервер.

`wordpress/` - вихідний код повноцінних плагінів для WordPress/PHP/MySQL. У цій версії дані зберігаються сервером. Не завантажуйте WordPress, бази даних, wp-config.php чи облікові дані в GitHub.

## Встановлення

1. Запустіть `python build.py`.
2. Завантажте `build/brutal-barber.zip` і `build/stockroom.zip` у **Плагіни → Додати новий → Завантажити плагін** та активуйте.
3. Створіть сторінки з відповідними шорткодами. Плагіни надають власний шаблон сторінки на весь екран.
4. Для Stockroom увійдіть як адміністратор. Натисніть «Додати демотовари», щоб завантажити вигаданий каталог.

Оновлена тема портфоліо - `wordpress/cocoa-portfolio/`. HTML-портфоліо експортується командою `python export_portfolio.py`; після змін у темі виконайте її повторно. `prepare_portfolio.py --source PATH` потрібен лише для початкового імпорту теми у порожню папку. Для публікації всієї збірки використовується `docs/` у гілці `main`. Публічні статичні копії самі по собі не синхронізуються з адмінкою локального WordPress.

Для запуску статичних демо: `python -m http.server 8766 --directory docs` та відкрийте `/barber/` або `/stockroom/`.

## Перевірки

`node --test tests/stockroom.test.cjs` - валідація та CSV. PHP перевіряється `php -l`. Результати інтеграційних та браузерних перевірок зберігаються в `CHECKS.md`.

## Авторство зображень

BRUTAL використовує фотографії Unsplash: [Kawê Rodrigues](https://unsplash.com/photos/JsiH9gv73n0) та [Joshua Rodriguez](https://unsplash.com/photos/CUXxqgjTAt4). Вони ілюструють настрій і не є роботами чи приміщенням вигаданого барбершопа. Фото не входять до GPL-ліцензії коду; див. [Unsplash License](https://unsplash.com/license).

Код: GPL-2.0-or-later. Макети й текст підготовлені для цього портфоліо.

Шрифт Onest збережений локально, без запитів до Google Fonts. Ліцензія SIL Open Font License міститься в `wordpress/cocoa-portfolio/assets/fonts/OFL.txt`.
Шрифт Onest постачається локально за SIL OFL, ліцензія - `wordpress/stockroom/assets/fonts/OFL.txt`.
