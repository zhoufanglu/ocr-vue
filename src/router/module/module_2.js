const b = () => import('@/views/module_2/b.vue')

const module_2 = [
  {
    path: '/b',
    meta: {
      requireAuth: true // 在需要登录的路由的meta中添加响应的权限标识
    },
    name: 'b',
    component: b
  }
]

export default module_2