<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import Navigation from './components/Navigation.vue';

const route = useRoute();
const isAuthPage = computed(() => route.name === 'auth');
const isSidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);

onMounted(() => {
  isSidebarCollapsed.value = localStorage.getItem('orbit-sidebar-collapsed') === 'true';
});

function setSidebarCollapsed(collapsed) {
  isSidebarCollapsed.value = collapsed;
  localStorage.setItem('orbit-sidebar-collapsed', String(collapsed));
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

watch(() => route.fullPath, closeMobileMenu);
</script>

<template>
  <div
    class="app-shell"
    :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
    @keydown.esc="closeMobileMenu"
  >
    <header v-if="!isAuthPage" class="mobile-app-bar">
      <button
        class="mobile-nav-toggle"
        type="button"
        :aria-label="isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'"
        aria-controls="app-navigation"
        :aria-expanded="isMobileMenuOpen"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            :d="isMobileMenuOpen ? 'm6 6 12 12M18 6 6 18' : 'M4 6h16M4 12h16M4 18h16'"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <RouterLink class="mobile-app-brand" to="/" aria-label="Orbit Study, início">
        <span>Orbit<span>.</span></span>
        <small>STUDY</small>
      </RouterLink>
    </header>
    <button
      v-if="!isAuthPage && isMobileMenuOpen"
      class="mobile-nav-backdrop"
      type="button"
      aria-label="Fechar menu"
      @click="closeMobileMenu"
    ></button>
    <Navigation
      v-if="!isAuthPage"
      id="app-navigation"
      :collapsed="isSidebarCollapsed"
      :mobile-open="isMobileMenuOpen"
      @update:collapsed="setSidebarCollapsed"
      @close-mobile-menu="closeMobileMenu"
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

.mobile-app-bar {
  display: none;
}

.mobile-nav-backdrop {
  display: none;
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

  .mobile-app-bar {
    position: sticky;
    z-index: 32;
    top: 0;
    display: flex;
    height: 57px;
    align-items: center;
    gap: 12px;
    padding: 0 17px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    backdrop-filter: blur(14px);
  }

  .mobile-nav-toggle {
    display: grid;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 11px;
    color: var(--text-soft);
    background: var(--surface);
    cursor: pointer;
  }

  .mobile-nav-toggle:hover {
    border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
    color: var(--accent);
  }

  .mobile-app-brand {
    display: flex;
    align-items: baseline;
    gap: 6px;
    color: var(--text);
    text-decoration: none;
  }

  .mobile-app-brand > span {
    font: 700 20px/.9 var(--font-title);
    letter-spacing: -.05em;
  }

  .mobile-app-brand > span > span {
    color: var(--accent);
  }

  .mobile-app-brand small {
    color: var(--muted);
    font: 600 7px var(--font-body);
    letter-spacing: .18em;
  }

  .mobile-nav-backdrop {
    position: fixed;
    z-index: 30;
    inset: 0;
    display: block;
    border: 0;
    background: rgb(25 17 26 / 42%);
    backdrop-filter: blur(2px);
  }

  .page-content {
    width: 100%;
    margin: 0;
    padding: 23px 18px 36px;
  }

  .auth-content {
    padding: 18px;
  }
}
</style>
