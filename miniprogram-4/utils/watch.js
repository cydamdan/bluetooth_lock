export function setWatcher(page) {
  let data = page.data;
  let watch = page.watch;
  Object.keys(watch).forEach(v => {
      let key = v.split('.');
      let nowData = data;
      for (let i = 0; i < key.length - 1; i++) {
          nowData = nowData[key[i]];
      }
      let lastKey = key[key.length - 1];
      let watchFun = watch[v].handler || watch[v];
      let deep = watch[v].deep;
      observe(nowData, lastKey, watchFun, deep, page);
  })
}
 
function observe(obj, key, watchFun, deep, page) {
  var val = obj[key];
  if (deep && val != null && typeof val === 'object') {
      Object.keys(val).forEach(childKey => {
          observe(val, childKey, watchFun, deep, page);
      })
  }
  Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function(newVal) {
          watchFun.call(page, newVal, val); 
          val = newVal;
          if (deep) {
              observe(obj, key, watchFun, deep, page);
          }
      },
      get: function() {
          return val;
      }
  })
}
module.exports = {
  setWatcher: setWatcher
}