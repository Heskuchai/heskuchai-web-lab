"""Import the installed portfolio theme and replace mockups with implemented cases."""
from pathlib import Path
import shutil, re, json, html, argparse

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,required=True,help='Path to the installed Cocoa Portfolio theme')
SOURCE=parser.parse_args().source.resolve()
theme=ROOT/'wordpress/cocoa-portfolio'
if theme.exists():
    raise SystemExit('Portfolio already prepared. Edit the imported theme directly.')
shutil.copytree(SOURCE,theme)
(theme/'assets').mkdir(exist_ok=True)
for name in ('barber','stockroom'):
    shutil.copy2(ROOT/'docs/assets'/f'{name}-preview.png',theme/'assets'/f'{name}-preview.png')
front=(theme/'front-page.php').read_text(encoding='utf-8')
front=front.replace('Місце для <em>моїх проєктів.</em>','Від ідеї — <em>до робочого проєкту.</em>')
front=front.replace('Від маленьких експериментів<br>до продуманих рішень.','Два авторські демопроєкти.<br>Дизайн, код і робочі сценарії.')
front=front.replace('Усе <sup>03</sup>','Усе <sup>02</sup>').replace('<button data-filter="code" aria-pressed="false">Алгоритми</button>','')
front=front.replace('Концепти для майбутніх робіт','WordPress · PHP · JavaScript')
start=front.index(' <div class="project-grid">')
end=front.index('<section class="skills',start)
cards=' <div class="project-grid">\n'
cases=[('web','barber','BRUTAL Barber','Лендинг барбершопа з формою запису та WordPress API.','ВЕБ · АВТОРСЬКИЙ ДЕМОПРОЄКТ'),('app','stockroom','Stockroom','Облік товарів, залишки, пошук та імпорт/експорт CSV.','ЗАСТОСУНОК · АВТОРСЬКИЙ ДЕМОПРОЄКТ')]
for i,(category,slug,title,desc,label) in enumerate(cases):
    cards+=f''' <button class="project-card" data-category="{category}" data-project="{i}" aria-label="Детальніше про {title}"><div class="project-art project-screenshot"><img src="<?php echo esc_url(get_template_directory_uri()); ?>/assets/{slug}-preview.png" alt="Скріншот реалізованого проєкту {title}" loading="lazy" width="1265" height="712"></div><div class="project-meta"><div><span class="project-type">{label}</span><h3>{title}</h3><p>{desc}</p></div><span class="project-arrow">↗</span></div></button>\n'''
cards+=' </div><p class="projects-disclaimer">Це реалізовані авторські демопроєкти, створені за участю AI, а не роботи для замовників. Публічні демо працюють у браузері; версії WordPress зберігають дані на сервері.</p>\n</div></section>\n'
front=front[:start]+cards+front[end:]
front=front.replace('ДЕМОНСТРАЦІЙНИЙ КОНЦЕПТ</p><h2 id="dialog-title"','АВТОРСЬКИЙ ДЕМОПРОЄКТ</p><h2 id="dialog-title"')
front=front.replace('Як можна розвинути ідею','Задача та реалізація')
front=front.replace('Це приклад подачі майбутнього проєкту, а не готовий продукт.','Реалізований демопроєкт. Без реального замовника. Деталі зберігання даних описані в README на GitHub.')
front=front.replace('<a class="text-link" href="<?php echo esc_url(get_theme_mod(\'cocoa_telegram\', \'https://t.me/Heskuchai\')); ?>" target="_blank" rel="noopener noreferrer">Обговорити ідею в Telegram ↗</a>', '<div class="case-links"><a id="case-demo" class="button primary" href="#" target="_blank" rel="noopener noreferrer">Відкрити демо ↗</a><a id="case-source" class="text-link" href="#" target="_blank" rel="noopener noreferrer">Код на GitHub ↗</a></div>')
front=front.replace('Тут — місце для моїх проєктів, експериментів та нових ідей.','Створюю авторські демопроєкти: від адаптивних сайтів до застосунків із базою даних.')
(theme/'front-page.php').write_text(front,encoding='utf-8')
js=(theme/'script.js').read_text(encoding='utf-8')
projects=[
 {'title':'BRUTAL Barber','description':'Адаптивний сайт вигаданого барбершопа: послуги, ціни, галерея, FAQ та запис на вільний час.','tags':['WordPress','PHP','REST API','JavaScript'],'detail':'Задача — провести відвідувача від знайомства зі студією до вибору часу. Реалізовано окремий плагін WordPress, форму з перевіркою даних, API вільних слотів та збереження заявок у MySQL. Унікальний індекс захищає від подвійного запису. Публічне демо зберігає тільки час та послугу у браузері, не надсилає заявки чи SMS.','demo':'barber/','source':'brutal-barber'},
 {'title':'Stockroom','description':'Застосунок для обліку товарів: каталог, категорії, залишки, сортування, пошук, архів та CSV.','tags':['WordPress','PHP / MySQL','JavaScript','CSV'],'detail':'Задача — спростити роботу з невеликим каталогом. Реалізовано CRUD через WordPress REST API з правами адміністратора, ціни в цілих копійках, унікальні артикули, архівування зі скасуванням останньої дії та атомарний імпорт CSV. Публічне демо працює у localStorage, версія WordPress — у базі сайту.','demo':'stockroom/','source':'stockroom'}
]
js=re.sub(r' const projects = \[.*?\n \];',' const projects = '+json.dumps(projects,ensure_ascii=False)+';',js,flags=re.S)
js=js.replace("dialog.querySelector('#dialog-detail').textContent = project.detail;", "dialog.querySelector('#dialog-detail').textContent = project.detail;\n   const demoRoot = window.CocoaProjects?.base || 'https://heskuchai.github.io/heskuchai-web-lab/';\n   dialog.querySelector('#case-demo').href = new URL(project.demo, demoRoot).href;\n   dialog.querySelector('#case-source').href = 'https://github.com/Heskuchai/heskuchai-web-lab/tree/main/wordpress/' + project.source;")
(theme/'script.js').write_text(js,encoding='utf-8')
css=(theme/'style.css').read_text(encoding='utf-8').replace('Version: 1.0.0','Version: 1.1.0')
css+='\n.project-screenshot{background:#e4ded4;padding:16px;display:flex;align-items:center}.project-screenshot img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:3px;box-shadow:0 10px 25px #49362b20;transition:transform .5s}.project-card:hover .project-screenshot img{transform:scale(1.025)}.case-links{display:flex;align-items:center;gap:25px;flex-wrap:wrap;margin-top:25px}.project-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:760px){.project-grid{grid-template-columns:minmax(0,1fr)}.project-screenshot{height:250px;padding:12px}.case-links{gap:20px}}\n'
(theme/'style.css').write_text(css,encoding='utf-8')
functions=(theme/'functions.php').read_text(encoding='utf-8').replace("'1.0.0'","'1.1.0'")
functions=functions.replace("wp_enqueue_script('cocoa', get_template_directory_uri() . '/script.js', array(), '1.1.0', true);", "wp_enqueue_script('cocoa', get_template_directory_uri() . '/script.js', array(), '1.1.0', true);\n    wp_localize_script('cocoa', 'CocoaProjects', array('base' => 'https://heskuchai.github.io/heskuchai-web-lab/'));")
(theme/'functions.php').write_text(functions,encoding='utf-8')
print('Portfolio theme imported; two implemented case studies added.')
