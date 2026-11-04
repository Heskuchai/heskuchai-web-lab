const test=require('node:test'),assert=require('node:assert/strict');
const {estimate}=require('../wordpress/opora-studio/assets/core.js');
const base={area:120,floors:1,material:'block',package:'ready'};
test('base demo calculation is exact',()=>assert.equal(estimate(base).total,3360000));
test('shell and two-floor coefficients',()=>{assert.equal(estimate({...base,package:'shell'}).total,2083200);assert.equal(estimate({...base,floors:2}).total,3494400);});
test('material selection affects rate',()=>{assert.equal(estimate({...base,material:'brick'}).rate,31000);assert.equal(estimate({...base,material:'timber'}).rate,26000);});
test('boundary areas',()=>{assert.equal(estimate({...base,area:60}).total,1680000);assert.equal(estimate({...base,area:240}).total,6720000);});
test('invalid input is rejected',()=>{for(const patch of [{area:0},{area:241},{area:60.5},{floors:3},{material:'toString'},{package:'unknown'}])assert.throws(()=>estimate({...base,...patch}));});
