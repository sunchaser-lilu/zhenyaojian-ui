import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './theme/index.less'
import './global.less'
import '@/utils/lazy_use' // use lazy load components
// import Viser from 'viser-vue'
// import '@/mock'
import store from './store'
import 'animate.css/source/animate.css'
import Plugins from '@/plugins'
import { initI18n } from '@/utils/i18n'
import bootstrap from '@/bootstrap'
import 'moment/locale/zh-cn'

const i18n = initI18n('CN', 'US')

Vue.config.productionTip = false
// Vue.use(Viser)
Vue.use(Plugins)

bootstrap({ router, store, i18n, message: Vue.prototype.$message, notification: Vue.prototype.$notification })

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
