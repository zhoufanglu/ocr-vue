import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home'

import module_1 from '@/router/module/module_1'
import module_2 from '@/router/module/module_2'

const ocr = () => import('@/views/ocr/index.vue')
const ocrEdit = () => import('@/views/ocr/ocrEdit.vue')


Vue.use(VueRouter)

const constantRoutes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requireAuth: false // 在需要登录的路由的meta中添加响应的权限标识
    }
  },
  {
    path: '/ocr',
    name: 'ocr',
    component: ocr,
    meta: {
      requireAuth: false // 在需要登录的路由的meta中添加响应的权限标识
    }
  },
  {
    path: '/ocrEdit',
    name: 'ocrEdit',
    component: ocrEdit,
    meta: {
      requireAuth: false // 在需要登录的路由的meta中添加响应的权限标识
    }
  },
  ...module_1,
  ...module_2
]

const createRouter = () =>
  new VueRouter({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

const router = createRouter()

export default router
