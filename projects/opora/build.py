from pathlib import Path
import shutil, zipfile, hashlib, re
from graphics import scene, house, PLAN, FLOOR_PLAN
from models import model, model_scene, plan, page_crane

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[1]
plugin=REPO/'wordpress/opora-studio'
packages=REPO/'build'
packages.mkdir(exist_ok=True)
template=(plugin/'page.html').read_text(encoding='utf-8')
template=template.replace('<main>','<main><div class="o-crane-journey">{{PAGE_CRANE}}',1).replace('</main>','</div></main>',1)
template=template.replace('<section class="o-projects', (ROOT/'workshop.html').read_text(encoding='utf-8')+'<section class="o-projects',1)
template=template.replace('<dialog class="o-project-dialog"', (ROOT/'crane-controls.html').read_text(encoding='utf-8')+'<dialog class="o-project-dialog"',1)
template=template.replace('Прокручуйте сторінку та спостерігайте,<br>як ідея набуває форми.','Спускайтеся вздовж червоної башти.<br>Кожен рівень відкриває новий етап.')
template=template.replace('49° · ЛІНІЯ НОВОГО ПОЧАТКУ','СКРОЛЬТЕ ВЗДОВЖ КРАНА ↓')
template=template.replace('Лісова тиша','Лісовий A-frame').replace('120 м²</span></div><p>Природні фактури та відкрита вітальня.</p><div class="o-project-features"><span>1 поверх</span><span>3 спальні</span><span>Панорамні вікна</span>', '84 м²</span></div><p>Трикутний силует, високий простір та антресоль.</p><div class="o-project-features"><span>2 рівні</span><span>2 спальні</span><span>А-подібний дах</span>')
template=template.replace('02 / ПРОСТІР ДЛЯ ВАШОГО ЖИТТЯ','03 / ПРОСТІР ДЛЯ ВАШОГО ЖИТТЯ').replace('03 / ІЗ ЧОГО ПОЧИНАЄТЬСЯ НАДІЙНІСТЬ','04 / ІЗ ЧОГО ПОЧИНАЄТЬСЯ НАДІЙНІСТЬ').replace('04 / ВАША ІДЕЯ В ЦИФРАХ','05 / ВАША ІДЕЯ В ЦИФРАХ').replace('05 / ПЕРЕД ПЕРШИМ КРОКОМ','06 / ПЕРЕД ПЕРШИМ КРОКОМ')
template=template.replace('Для простого життя з великими вікнами.','Г-подібний дім із плоскою зеленою покрівлею.').replace('Більше місця для кожного члена родини.','Двоповерхова вілла з балконом та сонячним дахом.')
template=template.replace('<div class="o-dialog-plan">{{FLOOR_PLAN}}</div>', '<div class="o-dialog-plan"><div data-dialog-plan="0">{{DIALOG_PLAN_ONE}}</div><div data-dialog-plan="1" hidden>{{DIALOG_PLAN_TWO}}</div><div data-dialog-plan="2" hidden>{{DIALOG_PLAN_THREE}}</div></div>')
tokens={'PAGE_CRANE':page_crane(),'HERO_SCENE':model_scene('hero-v2'),'STORY_SCENE':model_scene('story-v2'),'PLAN_ICON':PLAN,'HOUSE_ONE':model('project-one-v2','courtyard'),'HOUSE_TWO':model('project-two-v2','villa'),'HOUSE_THREE':model('project-three-v2','aframe'),'MATERIAL_HOUSE':model('material-v2','courtyard'),'FOOTER_HOUSE':PLAN,'FLOOR_PLAN':FLOOR_PLAN,'LAB_COURTYARD':model('lab-one','courtyard'),'LAB_VILLA':model('lab-two','villa'),'LAB_AFRAME':model('lab-three','aframe'),'PLAN_COURTYARD':plan('lab-plan-one','courtyard'),'PLAN_VILLA':plan('lab-plan-two','villa'),'PLAN_AFRAME':plan('lab-plan-three','aframe'),'DIALOG_PLAN_ONE':plan('dialog-one','courtyard'),'DIALOG_PLAN_TWO':plan('dialog-two','villa'),'DIALOG_PLAN_THREE':plan('dialog-three','aframe')}
for token,value in tokens.items():template=template.replace('{{'+token+'}}',value)
assert '{{' not in template
assert '\u2014' not in template and '\u2013' not in template
(plugin/'view.html').write_text(template,encoding='utf-8')
dist=REPO/'docs/opora';dist.mkdir(exist_ok=True)
shutil.copytree(plugin/'assets',dist/'assets',dirs_exist_ok=True)
head='<!doctype html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OPORA - будівельна студія</title><meta name="description" content="Авторський інтерактивний демопроєкт Heskuchai. Будинки, матеріали та історія будівництва."><link rel="icon" href="data:,"><link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/experience.css"></head><body>'
document=head+template+'<script src="assets/core.js"></script><script src="assets/motion.js"></script><script src="assets/app.js"></script><script src="assets/experience.js"></script></body></html>'
def versioned(match):
    name=match.group(1)
    digest=hashlib.sha256((dist/'assets'/name).read_bytes()).hexdigest()[:12]
    return 'assets/'+name+'?v='+digest
document=re.sub(r'assets/([a-z]+\.(?:css|js))',versioned,document)
(dist/'index.html').write_text(document,encoding='utf-8')
with zipfile.ZipFile(packages/'opora-studio-wordpress.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in plugin.rglob('*'):
        if f.is_file():z.write(f,f.relative_to(REPO/'wordpress'))
with zipfile.ZipFile(packages/'opora-studio-html.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in dist.rglob('*'):
        if f.is_file() and f.name != "qa.html":z.write(f,f.relative_to(dist))
print('OPORA static demo and WordPress ZIP built.')
