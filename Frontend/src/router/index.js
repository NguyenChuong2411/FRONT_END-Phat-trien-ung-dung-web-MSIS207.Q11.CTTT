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
      path: '/online-test/full-test/:testId',
      name: 'full-test',
      component: () => import('../pages/online-test/online-test_modal/FullTestPage.vue'),
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
  ],
})

export default router
