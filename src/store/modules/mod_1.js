
const mod_1 = {
  state: {
    userInfo: {
      token: '',
      userName: 'test',
    },
  },

  mutations: {
    SET_RISK_USER_INFO(state, val) {
      state.userInfo = Object.assign(state.userInfo, val)
    },
  },

  actions: {
    setRiskUserInfo({ commit }, val) {
      commit('SET_RISK_USER_INFO', val)
    },
  },
}

export default mod_1
