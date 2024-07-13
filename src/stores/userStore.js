import { defineStore } from 'pinia'

export const userStore = defineStore('user', {
  state: () => ({
    mobile: '',
    registerToken: '',
    token: null,
    roles: [],
    profile: {},
  }),
  getters: {
    getMobile: (state) => state.mobile,
    getRegisterToken: (state) => state.registerToken,
    getAuth: (state) => state.token ? true : false,
    getIsAdmin: (state) => (state.roles?.some(x => x == 'admin')),
    getRoles: (state) => state.roles,
    getIsInRole: (state, role) => state.roles?.some(x => x == role),
    getUser:(state)=> state.profile,
  },
  actions: {
    setMobile(mobile) {
      this.mobile = mobile
    },
    setRegisterToken(token) {
      this.registerToken = token
    },
    setAuth(token) { this.token = token },
    setLogOut() {
      this.token = null
      this.roles = []
      this.mobile = ''
      this.registerToken = ''
      this.profile={}
    },
    setUser(user) {
      this.profile = user
      this.roles=user?.roles
      this.store= user?.store
    },
  }
})