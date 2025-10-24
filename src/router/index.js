import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// ===== AUTH =====
import LoginPage from '../pages/auth/LoginPage.vue'

// ===== MISC =====
import LandingPage from '../pages/LandingPage.vue'
import Forbidden from '../pages/misc/Forbidden.vue'
import NotFound from '../pages/misc/NotFound.vue'

// ===== PPIC =====
import DashboardPPIC from '../pages/ppic/DashboardPPIC.vue'
import ProductionPlanPage from '../pages/ppic/ProductionPlanPage.vue'
import ProductsPage from '@/pages/ppic/ProductsPage.vue'

// ===== PRODUCTION =====
import DashboardProduction from '../pages/production/DashboardProduction.vue'
import ProductionOrderList from '../pages/production/ProductionOrderList.vue'
import ProductionReport from '../pages/production/ProductionReport.vue'
import ProductionLog from '@/pages/ProductionLog.vue'



const routes = [
  // ===== PUBLIC =====
  { path: '/', name: 'LandingPage', component: LandingPage, meta: { public: true } },
  { path: '/login', name: 'LoginPage', component: LoginPage, meta: { public: true } },

  // ===== PPIC =====
  { path: '/ppic', name: 'DashboardPPIC', component: DashboardPPIC, meta: { requiresAuth: true } },
  { path: '/ppic/plans', component: ProductionPlanPage, meta: { requiresAuth: true } },
  { path: '/ppic/products', component: ProductsPage, meta: { requiresAuth: true } },

  // ===== PRODUCTION =====
  { path: '/production', name: 'DashboardProduction', component: DashboardProduction, meta: { requiresAuth: true } },
  { path: '/production/orders', component: ProductionOrderList, meta: { requiresAuth: true } },
  { path: '/production/reports', component: ProductionReport, meta: { requiresAuth: true } },
  { path: '/production/logs', component: ProductionLog, meta: { requiresAuth: true } },

  // ===== MISC =====
  { path: '/forbidden', component: Forbidden },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ===== MIDDLEWARE LOGIN CEK =====
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Cek apakah butuh login
  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }

  // Jika sudah login dan buka /login atau /
  if (auth.token && (to.path === '/' || to.path.startsWith('/login'))) {
    // Redirect ke halaman terakhir sesuai preferensi user
    const lastModule = auth.user?.lastModule || 'ppic' // default ppic
    return next(`/${lastModule}`)
  }

  next()
})

export default router
