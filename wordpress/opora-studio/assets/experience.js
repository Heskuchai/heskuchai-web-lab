(()=>{'use strict';
const root=document.querySelector('#opora');if(!root)return;const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
const journey=$('.o-crane-journey'),crane=$('.o-page-crane'),tower=$('.o-tower-column'),rig=$('.o-travelling-load'),rope=$('.o-rope'),controller=$('#o-crane-control-toggle'),panel=$('#o-crane-control-panel');
let tick=0,auto=true,offsetY=0,offsetX=-115,freezeY=null,currentHookY=0,currentProgress=0;
const small=matchMedia('(max-width:760px)');if(small.matches)offsetX=-25;
let craneLayout=null,displayX=offsetX,displayY=offsetY,lastDepth=-1;
const trolley=$('.o-crane-trolley'),readout=$('.o-load-readout'),depthOutput=$('#o-crane-depth');
window.OporaMotion.measure(()=>{const r=journey.getBoundingClientRect(),t=tower.getBoundingClientRect(),jib=$('.o-page-jib').getBoundingClientRect();craneLayout={top:r.top+scrollY,height:r.height,start:jib.top-r.top+jib.height*.65,center:t.left-r.left+t.width/2};});
function paintCrane({scrollY:pageY,dt}){
 if(!craneLayout)return;
 displayX=window.OporaCore.damp(displayX,offsetX,dt,95);displayY=window.OporaCore.damp(displayY,offsetY,dt,95);
 if(Math.abs(displayX-offsetX)<.05)displayX=offsetX;if(Math.abs(displayY-offsetY)<.05)displayY=offsetY;
 const {top,height,start,center}=craneLayout;
 const position=window.OporaCore.cranePosition({journeyTop:top-pageY,journeyHeight:height,viewportHeight:innerHeight,ropeStart:start,towerCenter:center,mobile:small.matches,offsetX:displayX,offsetY:displayY,auto,frozenY:freezeY??currentHookY});
 const y=position.hookY,x=position.hookX;currentHookY=y;currentProgress=position.depth/48;
 const ropeWidth=small.matches?5:9,rigWidth=small.matches?44:82;
 rope.style.transform=`translate3d(${(x-ropeWidth/2).toFixed(3)}px,${start.toFixed(3)}px,0) scaleY(${position.ropeLength.toFixed(3)})`;
 rig.style.transform=`translate3d(${(x-rigWidth/2).toFixed(3)}px,${y.toFixed(3)}px,0)`;
 trolley.style.transform=`translate3d(${(x-14).toFixed(3)}px,${(start-15).toFixed(3)}px,0)`;
 if(position.depth!==lastDepth){lastDepth=position.depth;readout.textContent=String(lastDepth).padStart(2,'0')+' м';depthOutput.textContent=lastDepth+' м';}
 if(displayX!==offsetX||displayY!==offsetY)window.OporaMotion.request();
}
window.OporaMotion.subscribe(paintCrane);
function schedule(){window.OporaMotion.request();}
small.addEventListener('change',()=>{offsetX=small.matches?-25:-115;window.OporaMotion.invalidate();});
function openPanel(open){panel.hidden=!open;controller.setAttribute('aria-expanded',String(open));controller.querySelector('span').textContent=open?'-':'＋';if(open)$('#o-crane-panel-close').focus({preventScroll:true});}
controller.addEventListener('click',()=>openPanel(panel.hidden));$('#o-crane-panel-close').addEventListener('click',()=>{openPanel(false);controller.focus({preventScroll:true});});$$('[data-open-crane]').forEach(b=>b.addEventListener('click',()=>openPanel(true)));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)openPanel(false);});
$$('[data-cargo]').forEach(button=>button.addEventListener('click',()=>{const cargo=button.dataset.cargo;$$('[data-cargo-art]').forEach(art=>{art.style.display=art.dataset.cargoArt===cargo?'':'none';art.removeAttribute('hidden');});$$('[data-cargo]').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});$('#o-crane-cargo-name').textContent={timber:'Балки',brick:'Цегла',slab:'Плита'}[cargo];rig.classList.remove('o-cargo-changed');void rig.offsetWidth;rig.classList.add('o-cargo-changed');}));
$$('[data-crane-move]').forEach(button=>button.addEventListener('click',()=>{const direction=button.dataset.craneMove;if(direction==='left'||direction==='right'){offsetX+=(direction==='left'?-1:1)*25;offsetX=Math.max(small.matches?-75:-190,Math.min(small.matches?-20:-65,offsetX));}else{const delta=direction==='up'?-75:75;if(auto)offsetY=Math.max(-250,Math.min(250,offsetY+delta));else freezeY=(freezeY??currentHookY)+delta;}schedule();}));
$('#o-crane-auto').addEventListener('click',e=>{auto=!auto;freezeY=auto?null:currentHookY;e.currentTarget.setAttribute('aria-pressed',String(auto));e.currentTarget.textContent=auto?'✓ Вантаж слідує за прокруткою':'Ⅱ Положення вантажу зафіксовано';schedule();});
$('#o-crane-reset').addEventListener('click',()=>{offsetX=small.matches?-25:-115;offsetY=0;auto=true;freezeY=null;$('#o-crane-auto').setAttribute('aria-pressed','true');$('#o-crane-auto').textContent='✓ Вантаж слідує за прокруткою';schedule();});
const figure=$('.o-lab-figure');
const models={courtyard:{label:'01 / COURTYARD HOUSE',area:96,floors:1,detail:'Г-подібний будинок із внутрішньою терасою та озелененою плоскою покрівлею.'},villa:{label:'02 / TWO-STOREY VILLA',area:144,floors:2,detail:'Двоповерхова вілла: два зміщені об’єми, скляний балкон і сонячні панелі на даху.'},aframe:{label:'03 / FOREST A-FRAME',area:84,floors:2,detail:'Трикутний каркас із високим скляним торцем. Антресоль утворює другий рівень під покрівлею.'}};
let chosen='courtyard',explode=0,highlight=null;
function applyLayers(){
 figure.style.setProperty('--lab-scale',String(1-explode*.0015));figure.style.setProperty('--lift-padding',explode*.25+'px');
 $$('.o-lab-built [data-build-part]').forEach(part=>{const name=part.dataset.buildPart,shift=name==='roof'?-explode*1.2:name==='walls'?-explode*.5:0;part.style.transform=`translateY(${shift}px)`;part.classList.toggle('o-part-highlight',name===highlight);});
 $('#o-explode').value=explode;$('#o-explode-value').textContent=Math.round(explode)+'%';
}
$$('[data-lab-select]').forEach(button=>button.addEventListener('click',()=>{stopBuild();chosen=button.dataset.labSelect;$$('[data-lab-model]').forEach(model=>model.hidden=model.dataset.labModel!==chosen);$$('[data-lab-select]').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});$('#o-lab-model-label').textContent=models[chosen].label;$('#o-lab-detail').textContent=models[chosen].detail;applyLayers();}));
$$('[data-lab-view]').forEach(button=>button.addEventListener('click',()=>{stopBuild();figure.dataset.view=button.dataset.labView;$$('[data-lab-view]').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});const noLayers=button.dataset.labView==='plan';$('#o-explode').disabled=noLayers;$('#o-tilt').disabled=noLayers;$('#o-lab-explode').disabled=noLayers;$('#o-lab-assemble').disabled=noLayers;$('.o-lab-pointer-note').textContent=noLayers?'Схема зонування обраного концепту':'Спробуйте розібрати конструкцію ↗';}));
$('#o-explode').addEventListener('input',e=>{stopBuild();explode=Number(e.target.value);applyLayers();});$('#o-lab-explode').addEventListener('click',()=>{stopBuild();explode=100;applyLayers();});$('#o-lab-assemble').addEventListener('click',()=>{stopBuild();explode=0;applyLayers();});
$('#o-tilt').addEventListener('input',e=>{figure.style.setProperty('--lab-tilt',e.target.value+'deg');});
$('#o-lab-night').addEventListener('click',e=>{const night=figure.classList.toggle('o-lab-night');e.currentTarget.setAttribute('aria-pressed',String(night));e.currentTarget.textContent=night?'☾ Вечір / день':'☼ День / вечір';});
$$('[data-highlight]').forEach(button=>button.addEventListener('click',()=>{highlight=highlight===button.dataset.highlight?null:button.dataset.highlight;$$('[data-highlight]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.highlight===highlight)));const descriptions={foundation:'Основа: розподіляє навантаження. Тут показана лише схематична плита.',walls:'Стіни: утворюють різну геометрію кожного будинку. У режимі конструкції видно умовний каркас.',roof:'Покрівля: плоска зелена, сонячна тераса або два високі скати A-frame - залежно від моделі.'};$('#o-lab-detail').textContent=highlight?descriptions[highlight]:models[chosen].detail;applyLayers();}));
let buildFrame=0;
function stopBuild(){if(buildFrame)cancelAnimationFrame(buildFrame);buildFrame=0;figure.classList.remove('o-lab-playing');$('#o-lab-play').setAttribute('aria-pressed','false');$('#o-lab-play').textContent='▷ Показати збірку';}
$('#o-lab-play').addEventListener('click',()=>{if(buildFrame){stopBuild();return;}if(figure.dataset.view==='plan')root.querySelector('[data-lab-view="facade"]').click();figure.classList.add('o-lab-playing');$('#o-lab-play').setAttribute('aria-pressed','true');$('#o-lab-play').textContent='Ⅱ Зупинити збірку';const started=performance.now();function animate(now){const progress=Math.min(1,(now-started)/2800);explode=100*(1-(progress*progress*(3-2*progress)));applyLayers();if(progress<1)buildFrame=requestAnimationFrame(animate);else stopBuild();}explode=100;applyLayers();buildFrame=requestAnimationFrame(animate);});
$('#o-lab-calculate').addEventListener('click',()=>{const model=models[chosen],area=$('#o-area');area.value=model.area;area.dispatchEvent(new Event('input',{bubbles:true}));root.querySelector('[data-floors="'+model.floors+'"]').click();window.OporaMotion.scrollToElement($('#o-calculator'));});
$$('[data-cargo-art]').forEach(art=>{if(art.dataset.cargoArt!=='timber'){art.removeAttribute('hidden');art.style.display='none';}});
applyLayers();schedule();
})();
