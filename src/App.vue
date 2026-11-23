<script setup>
import Navigation from './components/Navigation.vue';
</script>

<template>
  <div class="app-shell">
    <Navigation />
    <main class="content page-content">
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
  width: min(calc(100% - 238px), 1420px);
  margin: 0 auto 0 238px;
  padding: 41px clamp(26px, 4vw, 58px) 56px;
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
}
</style>
