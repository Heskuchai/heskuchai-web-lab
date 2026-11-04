(function(root){'use strict';
const rates={block:28000,brick:31000,timber:26000};
function estimate({area,floors,material,package:packageName}){
 if(!Number.isInteger(area)||area<60||area>240)throw Error('Площа має бути цілим числом від 60 до 240 м².');
 if(![1,2].includes(floors)||!Object.hasOwn(rates,material)||!['shell','ready'].includes(packageName))throw Error('Неправильні параметри розрахунку.');
 const rate=rates[material],packageFactor=packageName==='shell'?62:100,floorFactor=floors===2?104:100;
 return {total:Math.round(area*rate*packageFactor*floorFactor/10000),rate,area,floors,material,package:packageName};
}
function cranePosition({journeyTop,journeyHeight,viewportHeight,ropeStart,towerCenter,mobile=false,offsetX=-115,offsetY=0,auto=true,frozenY=null}){
 const end=Math.max(ropeStart+70,journeyHeight-145),anchor=viewportHeight*(mobile ? .67 : .57);
 const requested=auto?-journeyTop+anchor+offsetY:(frozenY??ropeStart+70);
 const hookY=Math.max(ropeStart+70,Math.min(end,requested)),hookX=towerCenter+Math.max(mobile?-75:-190,Math.min(mobile?-20:-65,offsetX));
 return {hookY,hookX,ropeLength:Math.max(0,hookY-ropeStart),depth:Math.round(Math.max(0,Math.min(1,(hookY-ropeStart)/(end-ropeStart)))*48)};
}
function damp(current,target,deltaMs,tauMs=105){
 if(![current,target,deltaMs,tauMs].every(Number.isFinite)||deltaMs<0||tauMs<=0)throw Error('Неправильні параметри згладжування.');
 return target+(current-target)*Math.exp(-deltaMs/tauMs);
}
function revealPart(timeline,stage){const value=Math.max(0,Math.min(1,(timeline-stage+.8)/.8));return value*value*(3-2*value);}
const api={estimate,rates,cranePosition,damp,revealPart};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OporaCore=api;
})(typeof window!=='undefined'?window:globalThis);
