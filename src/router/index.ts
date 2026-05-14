import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import AdminResourceNewPage from '../pages/AdminResourceNewPage.vue';
import ResourceDetailPage from '../pages/ResourceDetailPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/admin/resources/new', name: 'admin-resource-new', component: AdminResourceNewPage },
    { path: '/resource/:slug', name: 'resource-detail', component: ResourceDetailPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
