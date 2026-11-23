import { createRouter, createWebHistory } from 'vue-router';
import Subjects from '@/views/Subjects.vue';
import Home from '@/views/Home.vue';
import SubjectDetail from '@/views/SubjectDetail.vue';
import Settings from '@/views/Settings.vue';
import Profile from '@/views/Profile.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/subjects', name: 'subjects', component: Subjects },
  { path: '/subjects/:id', name: 'subject-detail', component: SubjectDetail },
  { path: '/settings', name: 'settings', component: Settings },
  { path: '/profile', name: 'profile', component: Profile },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
