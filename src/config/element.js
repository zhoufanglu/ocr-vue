import Vue from 'vue'
import '@/assets/scss/element/element-variables.scss'

import { Button, Select, Message,Tooltip, Dialog, Form,FormItem,
Input} from 'element-ui'

Vue.use(Button)
Vue.use(Select)
Vue.use(Tooltip)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

Vue.prototype.$message = Message


