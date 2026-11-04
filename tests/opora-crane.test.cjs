const test=require('node:test'),assert=require('node:assert/strict');
const {cranePosition}=require('../wordpress/opora-studio/assets/core.js');
const base={journeyTop:0,journeyHeight:5000,viewportHeight:800,ropeStart:100,towerCenter:1000};
test('scroll reveals a longer real cable',()=>{const a=cranePosition(base),b=cranePosition({...base,journeyTop:-1000});assert.equal(b.ropeLength-a.ropeLength,1000);assert.ok(b.depth>a.depth);});
test('hook remains below jib and above tower foundation',()=>{const top=cranePosition({...base,journeyTop:10000}),bottom=cranePosition({...base,journeyTop:-10000});assert.equal(top.hookY,170);assert.equal(bottom.hookY,4855);assert.equal(bottom.depth,48);});
test('manual vertical command moves cargo while preserving cable',()=>{const a=cranePosition(base),b=cranePosition({...base,offsetY:75});assert.ok(Math.abs(b.hookY-a.hookY-75)<1e-7);assert.ok(Math.abs(b.ropeLength-a.ropeLength-75)<1e-7);});
test('stopped cargo retains page position during scroll',()=>{const a=cranePosition({...base,auto:false,frozenY:1200}),b=cranePosition({...base,journeyTop:-2000,auto:false,frozenY:1200});assert.equal(a.hookY,b.hookY);});
test('trolley movement is bounded for desktop and mobile',()=>{assert.equal(cranePosition({...base,offsetX:-1000}).hookX,810);assert.equal(cranePosition({...base,offsetX:1000}).hookX,935);assert.equal(cranePosition({...base,mobile:true,offsetX:-1000}).hookX,925);assert.equal(cranePosition({...base,mobile:true,offsetX:1000}).hookX,980);});
