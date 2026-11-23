<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navigation from './components/Navigation.vue';

const route = useRoute();
const isAuthPage = computed(() => route.name === 'auth');
</script>

<template>
  <div class="app-shell">
    <Navigation v-if="!isAuthPage" />
    <main class="content page-content" :class="{ 'auth-content': isAuthPage }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  color: var(--text);
  background: var(--bg);
  transition: background .25s ease, color .25s ease;
}

.content {
  min-width: 0;
  margin-left: 238px;
}

.page-content {
  width: min(calc(100% - 238px), 1680px);
  margin: 0 auto 0 238px;
  padding: 41px clamp(22px, 2.7vw, 42px) 56px;
}

.auth-content {
  width: 100%;
  margin: 0;
  padding: 24px;
}

@media (max-width: 720px) {
  .content {
    margin-left: 0;
  }

  .page-content {
    width: 100%;
    margin: 0;
    padding: 25px 20px 38px;
  }

  .auth-content {
    padding: 18px;
  }
}
</style>
