const test=require('node:test'),assert=require('node:assert/strict');
const {damp,revealPart}=require('../wordpress/opora-studio/assets/core.js');
test('damping is independent of 60/120 Hz frame rate',()=>{let a=0,b=0;for(let i=0;i<60;i++)a=damp(a,1000,1000/60);for(let i=0;i<120;i++)b=damp(b,1000,1000/120);assert.ok(Math.abs(a-b)<1e-8);});
test('damping moves monotonically and never overshoots',()=>{let x=0;for(let i=0;i<100;i++){const next=damp(x,100,16);assert.ok(next>=x&&next<=100);x=next;}assert.ok(x>99);assert.equal(damp(50,0,0),50);assert.ok(damp(50,0,16)>0);});
test('reversing the target starts from the current position',()=>{const x=damp(0,1000,100);const reverse=damp(x,0,16);assert.ok(reverse<x&&reverse>0);});
test('construction layers have intermediate opacity and bounded endpoints',()=>{assert.equal(revealPart(0,1),0);assert.equal(revealPart(1,1),1);assert.ok(revealPart(.6,1)>.4&&revealPart(.6,1)<.6);assert.equal(revealPart(3,3),1);assert.equal(revealPart(-100,2),0);assert.equal(revealPart(100,2),1);});
