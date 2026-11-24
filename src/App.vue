<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Navigation from './components/Navigation.vue';

const route = useRoute();
const isAuthPage = computed(() => route.name === 'auth');
const isSidebarCollapsed = ref(false);

onMounted(() => {
  isSidebarCollapsed.value = localStorage.getItem('orbit-sidebar-collapsed') === 'true';
});

function setSidebarCollapsed(collapsed) {
  isSidebarCollapsed.value = collapsed;
  localStorage.setItem('orbit-sidebar-collapsed', String(collapsed));
}
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <Navigation
      v-if="!isAuthPage"
      :collapsed="isSidebarCollapsed"
      @update:collapsed="setSidebarCollapsed"
    />
    <main class="content page-content" :class="{ 'auth-content': isAuthPage }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  --sidebar-width: 238px;
  min-height: 100vh;
  color: var(--text);
  background: var(--bg);
  transition: background .25s ease, color .25s ease;
}

.app-shell.sidebar-collapsed {
  --sidebar-width: 78px;
}

.content {
  min-width: 0;
  margin-left: var(--sidebar-width);
  transition: margin-left .22s ease;
}

.page-content {
  width: min(calc(100% - var(--sidebar-width)), 1680px);
  margin: 0 auto 0 var(--sidebar-width);
  padding: 41px clamp(22px, 2.7vw, 42px) 56px;
  transition: width .22s ease, margin-left .22s ease;
}

.auth-content {
  width: 100%;
  margin: 0;
  padding: 24px;
}

@media (max-width: 720px) {
  .app-shell,
  .app-shell.sidebar-collapsed {
    --sidebar-width: 0px;
  }

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
