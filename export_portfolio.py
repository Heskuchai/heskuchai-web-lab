from pathlib import Path
import re, shutil, html, json

ROOT=Path(__file__).resolve().parent
import build_portfolio
build_portfolio.build()
theme=ROOT/'wordpress/cocoa-portfolio'
mods={'name':'Heskuchai','specialty':'Computer Science 122','intro':'Навчаюся на третьому курсі ХПІ. Тут зібрав свої проєкти: їх можна відкрити, спробувати й подивитися код.','telegram':'https://t.me/Heskuchai'}
config=ROOT/'tests/runtime/public-profile.json'
if config.exists(): mods.update(json.loads(config.read_text(encoding='utf-8')))
if mods['intro']=='Від ідеї до коду. Вивчаю комп’ютерні науки та створюю цифрові речі з увагою до деталей.': mods['intro']='Навчаюся на третьому курсі ХПІ. Тут зібрав свої проєкти: їх можна відкрити, спробувати й подивитися код.'
content='\n'.join((theme/name).read_text(encoding='utf-8') for name in ('header.php','front-page.php','footer.php'))
for key,value in mods.items():
    content=re.sub(r"<\?php echo esc_(?:html|url)\(get_theme_mod\('cocoa_"+key+r"', .*?\)\); \?>", lambda m:html.escape(value,quote=True),content)
content=re.sub(r"<\?php echo esc_url\(home_url\('(/[^']*)'\)\); \?>",lambda m:m[1][1:] if m[1]!='/' else './',content)
content=content.replace('<?php echo esc_url(get_template_directory_uri()); ?>','.')
content=content.replace('<?php language_attributes(); ?>','lang="uk"').replace("<?php bloginfo('charset'); ?>",'UTF-8')
content=content.replace('<?php wp_head(); ?>','<title>Heskuchai - портфоліо розробника</title><meta name="description" content="Heskuchai. Computer Science 122. Авторські вебпроєкти: BRUTAL Barber, Stockroom, OPORA, Тир всего та СТРУМ."><link rel="icon" href="data:,"><link rel="stylesheet" href="style.css?v=2.0.0">')
content=content.replace('<?php wp_footer(); ?>','<script src="script.js?v=2.0.0"></script>')
content=re.sub(r'<\?php.*?\?>','',content,flags=re.S)
(ROOT/'docs/index.html').write_text(content,encoding='utf-8')
for name in ('style.css','script.js'): shutil.copy2(theme/name,ROOT/'docs'/name)
shutil.copytree(theme/'assets',ROOT/'docs/assets',dirs_exist_ok=True)
print('Published portfolio HTML exported from theme.')
