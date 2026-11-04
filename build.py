from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parent
for slug, title, scripts in [('brutal-barber', 'BRUTAL — барбершоп · демопроєкт Heskuchai', ['app.js']), ('stockroom', 'Stockroom — облік товарів · Heskuchai', ['core.js', 'app.js'])]:
    source = ROOT / 'wordpress' / slug
    target = ROOT / 'docs' / ('barber' if slug == 'brutal-barber' else 'stockroom')
    target.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source / 'assets', target / 'assets', dirs_exist_ok=True)
    html = '<!doctype html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><meta name="description" content="Авторський демонстраційний проєкт Heskuchai. WordPress, PHP та JavaScript."><link rel="icon" href="data:,"><link rel="stylesheet" href="assets/style.css"><style>body{margin:0}html{scroll-behavior:smooth;scroll-padding-top:25px}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style></head><body>'
    html += (source / 'view.html').read_text(encoding='utf-8')
    html += ''.join('<script src="assets/' + script + '"></script>' for script in scripts) + '</body></html>'
    (target / 'index.html').write_text(html, encoding='utf-8')
    packages = ROOT / 'build'
    packages.mkdir(exist_ok=True)
    with zipfile.ZipFile(packages / (slug + '.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for file in source.rglob('*'):
            if file.is_file():
                z.write(file, file.relative_to(ROOT / 'wordpress'))
(ROOT / 'docs' / '.nojekyll').touch()
print('Static demos and WordPress plugin ZIPs built.')
