(function(root){
 'use strict';
 const fields=['sku','name','category','price','qty','min_qty'];
 function validate(raw){
   const item={sku:String(raw.sku??'').trim().toUpperCase(),name:String(raw.name??'').trim(),category:String(raw.category??'').trim()};
   if(!/^[A-Z0-9_-]{1,40}$/.test(item.sku))throw Error('Артикул: 1-40 латинських літер, цифр, - або _.');
   if(!item.name||item.name.length>100)throw Error('Назва: від 1 до 100 символів.');
   if(!item.category||item.category.length>50)throw Error('Категорія: від 1 до 50 символів.');
   const price=String(raw.price??'').trim();
   if(!/^\d{1,7}(\.\d{1,2})?$/.test(price))throw Error('Ціна: від 0 до 9 999 999,99; до двох знаків після крапки.');
   const [whole,fraction='']=price.split('.'); item.price_cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
   for(const key of ['qty','min_qty']){const value=String(raw[key]??'').trim();if(!/^\d{1,7}$/.test(value)||Number(value)>1000000)throw Error('Кількість: ціле число від 0 до 1 000 000.');item[key]=Number(value);}
   return item;
 }
 function parseCSV(text){
   text=text.replace(/^\uFEFF/,''); if(text.length>1000000)throw Error('Максимальний розмір CSV - 1 МБ.');
   const rows=[];let row=[],value='',quoted=false,afterQuote=false;
   for(let i=0;i<text.length;i++){
     const c=text[i];
     if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;afterQuote=true;}}else value+=c;continue;}
     if(c==='"'){if(value||afterQuote)throw Error('Неправильні лапки у CSV.');quoted=true;continue;}
     if(c===','||c==='\n'||c==='\r'){
       row.push(value);value='';afterQuote=false;
       if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v!==''))rows.push(row);row=[];}
     }else{if(afterQuote)throw Error('Зайві символи після лапок у CSV.');value+=c;}
   }
   if(quoted)throw Error('Незакриті лапки у CSV.');
   if(value||row.length||afterQuote){row.push(value);if(row.some(v=>v!==''))rows.push(row);}
   if(!rows.length||rows[0].join(',')!==fields.join(','))throw Error('Потрібні заголовки: '+fields.join(','));
   if(rows.length>501)throw Error('Максимум 500 товарів за один імпорт.');
   const seen=new Set();
   return rows.slice(1).map((r,i)=>{if(r.length!==6)throw Error('Рядок '+(i+2)+': потрібно 6 колонок.');let raw=Object.fromEntries(fields.map((f,j)=>[f,r[j]]));for(const f of ['name','category']){if(/^'[=+\-@\t\r]/.test(raw[f]))raw[f]=raw[f].slice(1);}let item;try{item=validate(raw);}catch(e){throw Error('Рядок '+(i+2)+': '+e.message);}if(seen.has(item.sku))throw Error('Дублікат артикулу: '+item.sku);seen.add(item.sku);return item;});
 }
 function csv(items){const cell=value=>'"'+String(value).replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';return '\uFEFF'+fields.join(',')+'\r\n'+items.map(p=>[p.sku,p.name,p.category,(p.price_cents/100).toFixed(2),p.qty,p.min_qty].map(cell).join(',')).join('\r\n');}
 const seed=[['LMP-001','Лампа настільна, біла','Освітлення',129000,12,5],['MUG-002','Чашка керамічна, 350 мл','Посуд',39000,28,10],['NTB-003','Блокнот А5, 80 аркушів','Канцелярія',24000,4,8],['BAG-004','Сумка бавовняна','Аксесуари',45000,16,5],['CND-005','Свічка в склянці, 180 г','Декор',58000,0,5],['PLN-006','Планер на тиждень','Канцелярія',32000,19,5],['VSE-007','Ваза скляна, 20 см','Декор',89000,3,4],['BOT-008','Пляшка для води','Аксесуари',65000,21,7]].map((r,i)=>({id:i+1,sku:r[0],name:r[1],category:r[2],price_cents:r[3],qty:r[4],min_qty:r[5],archived:0}));
 const api={validate,parseCSV,csv,seed};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StockroomCore=api;
})(typeof window!=='undefined'?window:globalThis);
