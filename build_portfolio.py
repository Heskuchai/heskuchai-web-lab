"""Single source of portfolio case copy, shared by WordPress and Pages."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parent
THEME = ROOT / 'wordpress/cocoa-portfolio'


def build():
    projects = json.loads((ROOT / 'portfolio/projects.json').read_text(encoding='utf-8'))
    assert len({p['id'] for p in projects}) == len(projects)
    index, articles = [], []
    for i, p in enumerate(projects, 1):
        e = {k: escape(str(v), quote=True) for k, v in p.items()}
        assert p['url'].startswith('https://') and p['code'].startswith('https://github.com/Heskuchai/')
        assert (THEME / 'assets' / p['image']).is_file()
        number = f'{i:02}'
        index.append(f'<a href="#work-{e["id"]}"><span>{number}</span>{e["name"]}<b aria-hidden="true">↓</b></a>')
        articles.append(f'''<article class="work" id="work-{e['id']}">
 <div class="work-copy"><div class="work-label"><span>{number}</span><span>{e['kind']}</span></div><h3>{e['name']}</h3><p class="work-question">{e['summary']}</p><p class="work-description">{e['description']}</p><div class="work-links"><a class="visit-link" href="{e['url']}" target="_blank" rel="noopener noreferrer">Відкрити сайт <span>↗</span></a><a class="code-link" href="{e['code']}" target="_blank" rel="noopener noreferrer">Код на GitHub ↗</a></div><p class="work-stack">{e['stack']}</p></div>
 <a class="work-media {e['id']}" href="{e['url']}" target="_blank" rel="noopener noreferrer" aria-label="Відкрити {e['name']}"><img src="<?php echo esc_url(get_template_directory_uri()); ?>/assets/{e['image']}" alt="{e['alt']}" width="1265" height="712" loading="lazy"><span class="image-open" aria-hidden="true">Відкрити ↗</span></a>
 <details class="work-details"><summary>Про цю роботу <span aria-hidden="true">+</span></summary><div class="work-detail-columns"><div><h4>Що всередині</h4><p>{e['inside']}</p></div><div><h4>Що варто знати</h4><p>{e['limit']}</p></div></div></details>
</article>''')
    template = (ROOT / 'portfolio/front-page.template.php').read_text(encoding='utf-8')
    template = template.replace('{{PROJECT_INDEX}}', '\n'.join(index)).replace('{{PROJECTS}}', '\n'.join(articles))
    template = template.replace('class="work-count">05', f'class="work-count">{len(projects):02}')
    (THEME / 'front-page.php').write_text(template, encoding='utf-8')
    print('Portfolio:', len(projects), 'cases built from editable copy.')


if __name__ == '__main__':
    build()
