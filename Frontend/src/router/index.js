import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '@/guards/AuthGuard.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/home/HomePage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/about/AboutPage.vue'),
    },
    {
      path: '/online-test',
      name: 'online-test',
      component: () => import('../pages/online-test/OnlineTestPage.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập
    },
    {
      path: '/online-test/full-test/:testId',
      name: 'full-test',
      component: () => import('../pages/online-test/online-test_modal/FullTestPage.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập
    },
    {
      path: '/online-test/results/:attemptId',
      name: 'test-result',
      component: () => import('../pages/online-test/TestResultPage.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login/LoginPage.vue'),
      beforeEnter: requireGuest, // Chỉ cho phép người chưa đăng nhập
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('../pages/news/NewsPage.vue'),
    },
    {
      path: '/sharing',
      name: 'sharing',
      component: () => import('../pages/sharing/SharingPage.vue'),
    },
    {
      path: '/flashcard',
      name: 'flashcard',
      component: () => import('../pages/flashcard/FlashcardPage.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../pages/contact/ContactPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../pages/profile/UserProfile.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập
    },
    {
      path: '/test-history',
      name: 'test-history',
      component: () => import('../pages/profile/TestHistoryPage.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập
    },
    {
      path: '/test-management',
      name: 'test-management',
      component: () => import('../pages/test-management/TestManagement.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập để quản lý đề thi
    },
    {
      path: '/test-management/create',
      name: 'create-test',
      component: () => import('../pages/test-management/create-test/CreateTestPage.vue'),
      beforeEnter: requireAuth, // Yêu cầu đăng nhập để tạo đề thi
    },
  ],
})

export default router
