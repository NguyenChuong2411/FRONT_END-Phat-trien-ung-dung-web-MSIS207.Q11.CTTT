import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/recruitment',
      name: 'recruitment',
      component: () => import('../pages/recruitment/RecruitmentPage.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../pages/contact/ContactPage.vue'),
    },
  ],
})

export default router
