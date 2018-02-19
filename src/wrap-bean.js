"use strict";
const Bean = require('../src/bean')
// wrap bean allowing to roast bean with private state
function wrapBean(wrapper, seed) {
  var wm = new WeakMap();
  if (seed == null) {
    seed = Object.create.bind(undefined, null);
  }
  return wrapper(function(me) {
    if (wm.has(me)) {
      return wm.get(me);
    } else {
      var ctx = seed();
      wm.set(me, ctx);
      return ctx;
    }
  });
}
Bean.wrap = wrapBean
module.exports = wrapBean