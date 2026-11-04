(()=>{'use strict';
const root=document.querySelector('#opora');if(!root)return;
const finePointer=matchMedia('(pointer:fine)'),html=document.documentElement;
const listeners=new Set(),measurers=new Set();
let frame=0,lastTime=0,measuring=true,animated=false,current=scrollY,target=current,max=0,preference=true,pendingFocus=null;
try{preference=localStorage.getItem('opora-scroll-smooth')!=='off';}catch{}
const enabled=()=>preference&&finePointer.matches;
function request(){if(!frame)frame=requestAnimationFrame(render);}
function invalidate(){measuring=true;request();}
function render(now){
 frame=0;const dt=lastTime?Math.min(50,Math.max(0,now-lastTime)):1000/60;lastTime=now;
 if(measuring){measuring=false;max=Math.max(0,html.scrollHeight-innerHeight);measurers.forEach(fn=>fn());target=Math.max(0,Math.min(max,target));}
 if(animated&&enabled()){
   current=window.OporaCore.damp(current,target,dt,105);
   if(Math.abs(target-current)<.25){current=target;animated=false;}
   window.scrollTo({top:current,left:0,behavior:'instant'});
 }else{current=window.scrollY;if(!animated)target=current;}
 const position=window.scrollY;
 if(html.dataset.oporaScrolling!==String(animated))html.dataset.oporaScrolling=String(animated);
 listeners.forEach(fn=>fn({scrollY:position,dt,time:now}));
 if(!animated&&pendingFocus){const element=pendingFocus;pendingFocus=null;const temporary=!element.hasAttribute('tabindex');if(temporary){element.setAttribute('tabindex','-1');element.addEventListener('blur',()=>element.removeAttribute('tabindex'),{once:true});}element.focus({preventScroll:true});}
 if(animated)request();else if(!frame)lastTime=0;
}
function cancel(){pendingFocus=null;animated=false;current=target=scrollY;lastTime=0;request();}
function to(y,{immediate=false}={}){
 max=Math.max(0,html.scrollHeight-innerHeight);target=Math.max(0,Math.min(max,y));current=scrollY;
 if(!enabled()||immediate){animated=false;window.scrollTo({top:target,behavior:immediate?'instant':'smooth'});request();return;}
 animated=Math.abs(target-current)>.25;lastTime=0;request();
}
function toElement(element){if(element)to(scrollY+element.getBoundingClientRect().top-25);}
function syncControl(){
 html.classList.toggle('opora-smooth-active',enabled());html.dataset.oporaScrollMode=enabled()?'smooth':'native';
 const button=root.querySelector('#o-smooth-scroll');if(!button)return;
 button.setAttribute('aria-pressed',String(enabled()));button.textContent=finePointer.matches?(enabled()?'≈ Плавна прокрутка: увімкнено':'≈ Плавна прокрутка: вимкнено'):'≈ Плавна прокрутка дотиком';button.disabled=!finePointer.matches;
}
window.addEventListener('wheel',event=>{
 if(!enabled()||event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
 const element=event.target instanceof Element?event.target:null;
 if(!element||element.closest('dialog[open],.o-crane-control-panel,textarea,select,input,[data-native-scroll]'))return;
 if(!event.deltaY)return;
 const delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);
 if(!Number.isFinite(delta))return;
 event.preventDefault();max=Math.max(0,html.scrollHeight-innerHeight);
 if(!animated)current=target=scrollY;
 target=Math.max(0,Math.min(max,target+delta));animated=Math.abs(target-current)>.25;request();
},{passive:false});
window.addEventListener('scroll',()=>{
 if(animated&&Math.abs(scrollY-current)>4){animated=false;current=target=scrollY;}
 request();
},{passive:true});
window.addEventListener('keydown',event=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(event.key))cancel();});
window.addEventListener('pointerdown',cancel,{passive:true});window.addEventListener('touchstart',cancel,{passive:true});
window.addEventListener('resize',invalidate,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();else invalidate();});
document.addEventListener('click',event=>{
 const anchor=event.target instanceof Element?event.target.closest('a[href^="#"]'):null;
 if(!anchor||!root.contains(anchor)||event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const href=anchor.getAttribute('href');if(!href||href==='#')return;
 let element;try{element=document.getElementById(decodeURIComponent(href.slice(1)));}catch{return;}if(!element)return;
 event.preventDefault();pendingFocus=event.detail===0?element:null;if(location.hash!==href)history.pushState(null,'',href);toElement(element);
});
root.querySelector('#o-smooth-scroll')?.addEventListener('click',()=>{preference=!preference;try{localStorage.setItem('opora-scroll-smooth',preference?'on':'off');}catch{}cancel();syncControl();});
finePointer.addEventListener('change',()=>{cancel();syncControl();invalidate();});
if('ResizeObserver' in window)new ResizeObserver(invalidate).observe(root);
window.OporaMotion={subscribe(fn){listeners.add(fn);request();return()=>listeners.delete(fn);},measure(fn){measurers.add(fn);invalidate();return()=>measurers.delete(fn);},request,invalidate,scrollTo:to,scrollToElement:toElement};
syncControl();request();
})();
