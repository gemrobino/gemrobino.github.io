import Vue from 'vue'
import Vuex from 'vuex'
import json_file from '../../public/jsons/projects_json.json'

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    isLoggedIn: false,
    user_content: {},
    user_score: 0,
    projects: json_file['projects_json'],
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
