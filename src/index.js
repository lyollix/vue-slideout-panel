var VueSlideoutPanel = require('./VueSlideoutPanel')

/*
var VueSlideoutPanelPlugin = {
  VueSlideoutPanel: VueSlideoutPanel,
  install: function (Vue) {
    Vue.component('vsp', VueSlideoutPanel)
  }
}
// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueSlideoutPanelPlugin)
}
*/

module.exports = VueSlideoutPanel
