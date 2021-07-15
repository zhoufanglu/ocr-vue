const a = () => import('@/views/module_1/a.vue')
const module_1 = [
  {
    path: '/a',
    meta: {
      requireAuth: false // 在需要登录的路由的meta中添加响应的权限标识
    },
    name: 'a',
    component: a
  }
]

export default module_1