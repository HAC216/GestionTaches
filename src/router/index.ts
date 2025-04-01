import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import MembreDasboard from '@/components/MembreDasboard.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/admin-dashboard',
    name: 'adminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/membre-dashboard',
    name: 'membreDashboard',
    component: MembreDasboard,
    meta: { requiresAuth: true, membreOnly: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router