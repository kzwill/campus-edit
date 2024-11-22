import { createWebHistory, createRouter } from 'vue-router'
// 获取views下的信息成为路由
const components = import.meta.glob('../views/**/index.vue')
const pages = import.meta.glob('../views/**/page.js', {
  eager: true,
  import: 'default'
})
const routes = Object.entries(pages).map(([path, meta]) => {
  const cmpPath = path.replace('page.js', 'index.vue')
  const component = components[cmpPath]
  path = path.replace('../views', '').replace('/page.js', '') || '/'
  const name = path.split('/').filter(Boolean).join('-') || 'index'
  return {
    path,
    name,
    component,
    meta
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export default router