import { createRouter, createWebHistory } from 'vue-router';
import Subjects from '@/views/Subjects.vue';
import Home from '@/views/Home.vue';
import SubjectDetail from '@/views/SubjectDetail.vue';
import Settings from '@/views/Settings.vue';
import Schedule from '@/views/Schedule.vue';
import StudyList from '@/views/StudyList.vue';
import Essays from '@/views/Essays.vue';
import EssayDetail from '@/views/EssayDetail.vue';
import Auth from '@/views/Auth.vue';
import { supabase } from '@/lib/supabase.js';

const routes = [
  { path: '/auth', name: 'auth', component: Auth },
  { path: '/', name: 'home', component: Home },
  { path: '/subjects', name: 'subjects', component: Subjects },
  { path: '/subjects/:id', name: 'subject-detail', component: SubjectDetail },
  { path: '/subjects/:subjectId/topics/:topicId', name: 'topic-detail', component: () => import('@/views/TopicDetail.vue') },
  { path: '/schedule', name: 'schedule', component: Schedule },
  { path: '/study-list', name: 'study-list', component: StudyList },
  { path: '/essays', name: 'essays', component: Essays },
  { path: '/essays/:id', name: 'essay-detail', component: EssayDetail },
  { path: '/settings', name: 'settings', component: Settings },
  { path: '/profile', redirect: { name: 'settings' } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  if (to.name === 'auth') return true;
  if (!supabase) return { name: 'auth' };

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return {
        name: 'auth',
        query: error ? { authError: 'session' } : { redirect: to.fullPath },
      };
    }
    return true;
  } catch {
    return {
      name: 'auth',
      query: { authError: 'session' },
    };
  }
});

export default router;
