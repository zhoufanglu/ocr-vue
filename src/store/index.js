import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import createPersistedState from "vuex-persistedstate"

/**********************模块引入***********************/
let ms = require.context('./modules', false, /\.js$/)
let modules = {}
ms.keys().forEach(k => {
  let n = k.substring(2, k.length - 3)
  modules[n] = ms(k).default
})

export default new Vuex.Store({
  modules,
  plugins: [createPersistedState()],
})
