(()=>{'use strict';
const host=document.querySelector('#stockroom');if(!host)return;
const $=s=>host.querySelector(s),core=window.StockroomCore,config=window.StockroomConfig;
let all=[],busy=false,lastTrigger,undoAction=null;
const money=n=>new Intl.NumberFormat('uk-UA',{style:'currency',currency:'UAH',currencyDisplay:'narrowSymbol',maximumFractionDigits:2}).format(n/100);
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function request(path='',method='GET',body){const r=await fetch(config.api+path,{method,headers:{'Content-Type':'application/json','X-WP-Nonce':config.nonce},credentials:'same-origin',...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.message||'Не вдалося виконати запит.');return data;}
const storageKey='heskuchai-stockroom-v1';
function localRead(){const value=localStorage.getItem(storageKey);if(!value)return structuredClone(core.seed);const parsed=JSON.parse(value);if(!Array.isArray(parsed))throw Error('Неправильні локальні дані.');return parsed.map((p,i)=>({...core.validate({...p,price:(p.price_cents/100).toFixed(2)}),id:Number(p.id)||i+1,archived:p.archived?1:0}));}
function persist(){localStorage.setItem(storageKey,JSON.stringify(all));}
const store={
 async load(){if(config)return request();const list=localRead();localStorage.setItem(storageKey,JSON.stringify(list));return list;},
 async save(item,id){if(config)return request(id?'/'+id:'',id?'PUT':'POST',item);if(all.some(p=>p.sku===item.sku&&p.id!==id))throw Error('Цей артикул уже використовується (можливо, в архіві).');const saved={...item,id:id||Math.max(0,...all.map(p=>p.id))+1,archived:0};const next=id?all.map(p=>p.id===id?saved:p):[...all,saved];localStorage.setItem(storageKey,JSON.stringify(next));all=next;return saved;},
 async archive(id,archived){if(config)return request('/'+id+'/archive','POST',{archived});const next=all.map(p=>p.id===id?{...p,archived}:p);localStorage.setItem(storageKey,JSON.stringify(next));all=next;},
 async import(items){if(config)return request('/import','POST',{items});const seen=new Set(all.map(p=>p.sku));for(const p of items){if(seen.has(p.sku))throw Error('Артикул уже існує: '+p.sku);seen.add(p.sku);}let id=Math.max(0,...all.map(p=>p.id));const next=[...all,...items.map(p=>({...p,id:++id,archived:0}))];localStorage.setItem(storageKey,JSON.stringify(next));all=next;}
};
function notice(message,undo){const toast=$('#sr-toast');toast.hidden=false;toast.querySelector('span').textContent=message;const btn=toast.querySelector('button');btn.hidden=!undo;undoAction=undo||null;}
$('#sr-toast button').addEventListener('click',async()=>{if(!undoAction)return;const action=undoAction;undoAction=null;try{await action();await refresh();notice('Товар повернуто до каталогу.');}catch(e){notice(e.message);}});
$('.sr-toast-close').addEventListener('click',()=>{$('#sr-toast').hidden=true;});
function active(){return all.filter(p=>!Number(p.archived));}
function render(){
 const products=active(),categories=[...new Set(products.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'uk'));
 const selected=$('#sr-category').value;$('#sr-category').innerHTML='<option value="">Усі категорії</option>'+categories.map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');if(categories.includes(selected))$('#sr-category').value=selected;
 $('#sr-category-list').innerHTML=categories.map(c=>`<option value="${safe(c)}"></option>`).join('');
 $('#sr-total').textContent=products.length;$('.sr-count').textContent=products.length;$('#sr-value').textContent=money(products.reduce((s,p)=>s+p.qty*p.price_cents,0));$('#sr-low').textContent=products.filter(p=>p.qty===0||p.qty<p.min_qty).length;$('#sr-categories').textContent=categories.length;
 const query=$('#sr-search').value.trim().toLocaleLowerCase('uk'),cat=$('#sr-category').value,status=$('#sr-status').value;
 const list=products.filter(p=>(p.name+' '+p.sku).toLocaleLowerCase('uk').includes(query)&&(!cat||p.category===cat)&&(!status||(status==='out'?p.qty===0:status==='low'?p.qty>0&&p.qty<p.min_qty:p.qty>0&&p.qty>=p.min_qty)));
 const order=$('#sr-sort').value;list.sort((a,b)=>order==='qty'?a.qty-b.qty:order==='value'?b.qty*b.price_cents-a.qty*a.price_cents:a.name.localeCompare(b.name,'uk'));
 $('#sr-results').textContent=`Показано ${list.length} із ${products.length} товарів`;
 host.querySelectorAll('[data-stock]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stock===status)));
 $('#sr-rows').innerHTML=list.map((p,index)=>`<tr><td class="sr-number">${String(index+1).padStart(2,'0')}</td><td><span class="sr-product-name">${safe(p.name)}</span><span class="sr-sku">${safe(p.sku)}</span></td><td><span class="sr-category-tag">${safe(p.category)}</span></td><td class="sr-numeric">${money(p.price_cents)}</td><td class="sr-numeric"><strong>${p.qty}</strong><span class="sr-minimum">мін. ${p.min_qty} шт.</span></td><td><span class="sr-stock-status ${p.qty===0?'out':p.qty<p.min_qty?'low':''}">${p.qty===0?'Немає':p.qty<p.min_qty?'Поповнити':'Достатньо'}</span></td><td><div class="sr-row-actions"><button data-edit="${p.id}" aria-label="Редагувати ${safe(p.name)}">Змінити</button><button data-archive="${p.id}" aria-label="Архівувати ${safe(p.name)}" title="Архівувати"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v12H4zM3 4h18v4H3zM9 12h6"/></svg></button></div></td></tr>`).join('');
 $('#sr-empty').hidden=!!list.length;
 $('#sr-empty-title').textContent=products.length?'Нічого не знайдено':'Каталог поки порожній';
 $('#sr-empty-description').textContent=products.length?'Спробуй інший запит або скинь фільтри.':'Додай перший товар або завантаж приклади під таблицею.';
 $('#sr-clear').hidden=!products.length;

}
async function refresh(){all=await store.load();render();}
async function guard(action){if(busy)return;busy=true;host.querySelectorAll('button').forEach(b=>b.disabled=true);try{await action();}catch(e){notice(e.message);}finally{busy=false;host.querySelectorAll('button').forEach(b=>b.disabled=false);}}
['#sr-search','#sr-category','#sr-status','#sr-sort'].forEach(selector=>$(selector).addEventListener(selector==='#sr-search'?'input':'change',render));
host.querySelectorAll('[data-stock]').forEach(button=>button.addEventListener('click',()=>{$('#sr-status').value=button.dataset.stock;render();}));
$('#sr-clear').addEventListener('click',()=>{$('#sr-search').value='';$('#sr-category').value='';$('#sr-status').value='';$('#sr-sort').value='name';render();$('#sr-search').focus();});
const dialog=$('#sr-dialog'),form=$('#sr-form');
function open(item,trigger){lastTrigger=trigger;form.reset();form.elements.id.value=item?.id||'';$('#sr-form-error').textContent='';$('#sr-dialog-title').textContent=item?'Редагувати товар':'Новий товар';if(item){for(const key of ['name','sku','category','qty','min_qty'])form.elements[key].value=item[key];form.elements.price.value=(item.price_cents/100).toFixed(2);}dialog.showModal();}
$('#sr-add').addEventListener('click',e=>open(null,e.currentTarget));$('.sr-close').addEventListener('click',()=>dialog.close());$('.sr-cancel').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>lastTrigger?.focus());
form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;try{const item=core.validate(Object.fromEntries(new FormData(form))),id=Number(form.elements.id.value)||null;busy=true;form.querySelector('[type=submit]').disabled=true;await store.save(item,id);await refresh();dialog.close();notice(id?'Зміни збережено.':'Товар додано.');}catch(error){$('#sr-form-error').textContent=error.message;}finally{busy=false;form.querySelector('[type=submit]').disabled=false;}});
let archiveId;const archiveDialog=$('#sr-archive-dialog');
$('#sr-rows').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),archive=e.target.closest('[data-archive]');if(edit)open(all.find(p=>p.id===Number(edit.dataset.edit)),edit);if(archive){archiveId=Number(archive.dataset.archive);lastTrigger=archive;archiveDialog.showModal();}});
$('#sr-archive-cancel').addEventListener('click',()=>archiveDialog.close());$('#sr-archive-confirm').addEventListener('click',()=>guard(async()=>{const id=archiveId;await store.archive(id,1);archiveDialog.close();await refresh();notice('Товар архівовано.',()=>store.archive(id,0));}));
$('#sr-import').addEventListener('click',()=>$('#sr-file').click());$('#sr-file').addEventListener('change',e=>guard(async()=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1000000)throw Error('Максимальний розмір - 1 МБ.');const items=core.parseCSV(await file.text());if(!items.length)throw Error('CSV не містить товарів.');await store.import(items);await refresh();notice(`Імпортовано товарів: ${items.length}.`);}finally{e.target.value='';}}));
$('#sr-export').addEventListener('click',()=>{const blob=new Blob([core.csv(active())],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='stockroom-products.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Експортовано весь активний каталог.');});
$('#sr-seed').addEventListener('click',()=>guard(async()=>{const skus=new Set(all.map(p=>p.sku));const items=core.seed.filter(p=>!skus.has(p.sku));if(!items.length){notice('Усі демотовари вже додані.');return;}await store.import(items);await refresh();notice('Демотовари додано.');}));
if(config){$('#sr-mode').textContent='Дані зберігаються в базі WordPress. Доступ має лише адміністратор.';$('.sr-demo-banner>span').textContent='WORDPRESS';}
refresh().catch(e=>{$('#sr-results').textContent='Не вдалося завантажити каталог.';notice('Помилка сховища: '+e.message);});
})();
