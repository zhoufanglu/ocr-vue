import Vue from 'vue'
import '@/assets/scss/element/element-variables.scss'

import { Button, Select, Message,Tooltip, Dialog } from 'element-ui'

Vue.use(Button)
Vue.use(Select)
Vue.use(Tooltip)
Vue.use(Dialog)

Vue.prototype.$message = Message


