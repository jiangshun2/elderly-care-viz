import { createRouter, createWebHashHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

/**
 * 路由表
 * meta.group  用于侧边栏分组
 * meta.icon   用于侧边栏图标
 * meta.title  用于页面标题 / 面包屑
 */
export const routes = [
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据驾驶舱', icon: 'dashboard', group: '监测总览' }
      },
      {
        path: 'health',
        name: 'Health',
        component: () => import('@/views/Health.vue'),
        meta: { title: '健康指标分析', icon: 'health', group: '健康服务' }
      },
      {
        path: 'service',
        name: 'Service',
        component: () => import('@/views/Service.vue'),
        meta: { title: '服务需求分析', icon: 'service', group: '健康服务' }
      },
      {
        path: 'emergency',
        name: 'Emergency',
        component: () => import('@/views/Emergency.vue'),
        meta: { title: '紧急事件监测', icon: 'emergency', group: '应急处置' }
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/Staff.vue'),
        meta: { title: '人员分布与响应', icon: 'staff', group: '应急处置' }
      },
      {
        path: 'archive',
        name: 'Archive',
        component: () => import('@/views/Archive.vue'),
        meta: { title: '老人健康档案', icon: 'archive', group: '基础数据' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title =
    (to.meta.title ? to.meta.title + ' · ' : '') + '社区养老服务与健康监测可视化系统'
})

export default router
