(() => {
 'use strict';
 const menu = document.querySelector('.menu-toggle');
 const nav = document.querySelector('#navigation');
 const closeMenu = () => { if (!menu || !nav) return; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Відкрити меню'); nav.classList.remove('is-open'); };
 menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню'); nav?.classList.toggle('is-open',open); });
 nav?.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e => { if(e.key === 'Escape') closeMenu(); });
 window.matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
 document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
   document.querySelectorAll('[data-filter]').forEach(b => { const active = b === button; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
   document.querySelectorAll('[data-category]').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
 }));
 const projects = [{"title": "BRUTAL Barber", "description": "Адаптивний сайт вигаданого барбершопа: послуги, ціни, галерея, FAQ та запис на вільний час.", "tags": ["WordPress", "PHP", "REST API", "JavaScript"], "detail": "Задача - провести відвідувача від знайомства зі студією до вибору часу. Реалізовано окремий плагін WordPress, форму з перевіркою даних, API вільних слотів та збереження заявок у MySQL. Унікальний індекс захищає від подвійного запису. Публічне демо зберігає тільки час та послугу у браузері, не надсилає заявки чи SMS.", "demo": "barber/", "source": "brutal-barber"}, {"title": "Stockroom", "description": "Застосунок для обліку товарів: каталог, категорії, залишки, сортування, пошук, архів та CSV.", "tags": ["WordPress", "PHP / MySQL", "JavaScript", "CSV"], "detail": "Задача - спростити роботу з невеликим каталогом. Реалізовано CRUD через WordPress REST API з правами адміністратора, ціни в цілих копійках, унікальні артикули, архівування зі скасуванням останньої дії та атомарний імпорт CSV. Публічне демо працює у localStorage, версія WordPress - у базі сайту.", "demo": "stockroom/", "source": "stockroom"}, {"title": "OPORA", "description": "Інтерактивний сайт вигаданої будівельної студії з авторською SVG-графікою та трьома різними моделями будинків.", "tags": ["WordPress", "JavaScript", "SVG", "CSS Animation"], "detail": "Задача - показати будівництво як інтерактивну історію. Червоний кран тягнеться вздовж сторінки, а гак супроводжує прокрутку. Є керування краном, вибір вантажу, майстерня будинків із розбиранням на шари, плани, день/ніч і калькулятор матеріалів. Анімації мають спільний цикл requestAnimationFrame та враховують налаштування зменшеного руху. Усі ціни демонстраційні; сайт не приймає реальних замовлень.", "demo": "opora/", "source": "opora-studio"}, {"title": "Тир всего", "description": "Окремий авторський проєкт із каталогом тирлистів, пошуком за предметами та редактором власних рейтингів.", "tags": ["JavaScript", "GitHub API", "IndexedDB", "Canvas / PNG"], "detail": "Каталог із категоріями, пошуком, закладками й окремими сторінками рейтингів. Власну розстановку можна зберегти у браузері та завантажити в PNG. Панель автора дозволяє додавати предмети, тексти, оцінки й зображення файлом або за URL. Чернетки зберігаються в IndexedDB, а публікація через GitHub API створює один коміт для даних та файлів. Доступ до публікації налаштовується особистим ключем власника. GitHub Actions перевіряє й публікує сайт.", "demo": "https://heskuchai.github.io/tier-of-everything/", "sourceURL": "https://github.com/Heskuchai/tier-of-everything"}, {"title": "СТРУМ. / Кременчук", "description": "Неофіційний сервіс графіків світла для Кременчуга з власним дизайном, інтерактивною шкалою доби та збереженими профілями.", "tags": ["JavaScript", "Python", "GitHub Actions", "Canvas / PNG"], "detail": "Дані надходять із відкритої сторінки Alerts.energy. Колектор на Python перевіряє графіки, а GitHub Actions періодично збирає й публікує сайт. Реалізовано підчерги, сьогодні/завтра, профілі, порівняння спільного часу, темну тему та PNG. Окремо обробляються аварійний режим, відсутність і застарівання даних: таймер та розрахунки вимикаються, якщо погодинний план ненадійний. Час розраховується для Europe/Kyiv. На прев’ю показано окремий деморежим; основне посилання відкриває сервіс із реальними даними джерела.", "demo": "https://heskuchai.github.io/strum-kremenchuk/", "sourceURL": "https://github.com/Heskuchai/strum-kremenchuk"}];
 const dialog = document.querySelector('.project-dialog');
 let trigger;
 document.querySelectorAll('[data-project]').forEach(card => card.addEventListener('click', () => {
   const project = projects[Number(card.dataset.project)];
   if (!dialog || !project) return;
   trigger = card;
   dialog.querySelector('#dialog-title').textContent = project.title;
   dialog.querySelector('#dialog-description').textContent = project.description;
   dialog.querySelector('#dialog-detail').textContent = project.detail;
   const demoRoot = window.CocoaProjects?.base || 'https://heskuchai.github.io/heskuchai-web-lab/';
   dialog.querySelector('#case-demo').href = new URL(project.demo, demoRoot).href;
   dialog.querySelector('#case-source').href = project.sourceURL || ('https://github.com/Heskuchai/heskuchai-web-lab/tree/main/wordpress/' + project.source);
   const tags = dialog.querySelector('.dialog-tags');
   tags.replaceChildren(...project.tags.map(tag => { const el = document.createElement('span'); el.textContent = tag; return el; }));
   dialog.showModal(); document.body.classList.add('modal-open');
 }));
 dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
 dialog?.addEventListener('click',e => { const r=dialog.getBoundingClientRect(); if(e.target === dialog && (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom)) dialog.close(); });
 dialog?.addEventListener('close', () => { document.body.classList.remove('modal-open'); trigger?.focus(); });
 if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
   const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);} }),{threshold:0.08});
   document.querySelectorAll('.about-copy,.section-heading,.project-card,.skill-list,.contact-inner').forEach(el => { el.classList.add('reveal-ready');observer.observe(el); });
 }
})();
