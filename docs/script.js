(() => {
 'use strict';
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
 const close=()=>{toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Відкрити меню');nav?.classList.remove('is-open');};
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрити меню':'Відкрити меню');nav?.classList.toggle('is-open',open);});
 nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 matchMedia('(min-width:761px)').addEventListener('change',close);
 const progress=document.querySelector('.reading-progress span');let scheduled=false;
 const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,scrollY/max)):0)+')';scheduled=false;};
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update);update();
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){nav?.querySelectorAll('a').forEach(a=>{const active=a.getAttribute('href')==='#'+entry.target.id;if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-15% 0px -55% 0px',threshold:0});document.querySelectorAll('#projects,#about,#contact').forEach(el=>observer.observe(el));}
})();
