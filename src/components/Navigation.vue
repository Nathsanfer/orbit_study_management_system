<template>
  <nav class="sidebar" aria-label="Navegação principal">
    <RouterLink to="/" class="brand" aria-label="Orbit Study, início">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="3" fill="currentColor" />
          <ellipse cx="16" cy="16" rx="11" ry="5.5" stroke="currentColor" stroke-width="1.25" transform="rotate(-35 16 16)" />
          <circle cx="24.8" cy="9.7" r="1.8" fill="currentColor" />
        </svg>
      </span>
      <span class="brand-word">Orbit<span>.</span><small>Study</small></span>
    </RouterLink>
    <p class="brand-caption">Seu espaço de aprendizado</p>
    <div class="sidebar-section-label">SEU ESPAÇO</div>
    <div class="primary-nav">
      <router-link to="/" class="nav-link" exact-active-class="nav-link-active">
        <span class="nav-link-icon" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="nav-link-copy"><span>Dashboard</span><small>Visão geral</small></span>
        <span class="nav-link-arrow" aria-hidden="true">→</span>
      </router-link>
      <router-link to="/subjects" class="nav-link" exact-active-class="nav-link-active">
        <span class="nav-link-icon" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v13H7a2 2 0 0 1-2-2V4.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H19M8.5 8h7M8.5 11h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </span>
        <span class="nav-link-copy"><span>Matérias</span><small>Sua jornada de estudos</small></span>
        <span class="nav-link-arrow" aria-hidden="true">→</span>
      </router-link>
      <router-link to="/schedule" class="nav-link" exact-active-class="nav-link-active">
        <span class="nav-link-icon" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h3M8 16.5h3M14 13h2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="nav-link-copy"><span>Cronograma</span><small>Planejamento semanal</small></span>
        <span class="nav-link-arrow" aria-hidden="true">→</span>
      </router-link>
    </div>
    <div class="sidebar-note">
      <span class="sidebar-note-mark" aria-hidden="true">✦</span>
      <p>Um pouco todos os dias também é <strong>progresso.</strong></p>
    </div>
    <div class="sidebar-footer">
      <RouterLink to="/profile" class="sidebar-profile" exact-active-class="sidebar-profile-active">
        <span class="profile-avatar" aria-hidden="true">E</span>
        <span class="profile-copy"><strong>Meu perfil</strong><small>Estudante Orbit</small></span>
        <svg class="profile-arrow" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </RouterLink>
      <RouterLink to="/settings" class="footer-action" exact-active-class="footer-action-active">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.86-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.86.34l-.06.06-2.83-2.83.06-.06a1.7 1.7 0 0 0 .34-1.86A1.7 1.7 0 0 0 3 13.97H2v-4h1a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.86l-.06-.06 2.83-2.83.06.06a1.7 1.7 0 0 0 1.86.34A1.7 1.7 0 0 0 9.94 3V2h4v1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.86-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.86A1.7 1.7 0 0 0 21 9.94h1v4h-1a1.7 1.7 0 0 0-1.6 1.06Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <span>Configurações</span>
      </RouterLink>
      <button
        class="theme-switch"
        type="button"
        :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
        :aria-pressed="isDark"
        @click="toggleTheme"
      >
        <span class="theme-switch-icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
            <path d="M16.8 12.1A7.2 7.2 0 0 1 7.9 3.2a7.4 7.4 0 1 0 8.9 8.9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </span>
        <span>Alternar tema</span>
        <span class="switch-track" :class="{ 'switch-on': isDark }" aria-hidden="true"><i></i></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDark = ref(false);
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
}
function toggleTheme() {
  isDark.value = !isDark.value;
  applyTheme();
  localStorage.setItem('orbit-theme', isDark.value ? 'dark' : 'light');
}
onMounted(() => {
  const savedTheme = localStorage.getItem('orbit-theme');
  isDark.value = savedTheme
    ? savedTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme();
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  z-index: 5;
  inset: 0 auto 0 0;
  display: flex;
  width: 238px;
  flex-direction: column;
  padding: 30px 18px 20px;
  border-right: 1px solid var(--border);
  background: var(--surface);
  transition: background .25s ease, border-color .25s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 9px;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 15px;
  color: #fffafc;
  background: #783f55;
  box-shadow: 0 5px 13px rgb(120 63 85 / 20%);
}

.brand-mark svg {
  width: 28px;
  height: 28px;
}

.brand-word {
  color: var(--text);
  font: 700 23px/.9 var(--font-title);
  letter-spacing: -.055em;
}

.brand-word > span {
  color: var(--c-lavender);
}

.brand-word small {
  display: block;
  margin-top: 6px;
  color: var(--muted);
  font: 600 8px/1 var(--font-body);
  letter-spacing: .2em;
  text-transform: uppercase;
}

.brand-caption {
  margin: 13px 10px 0;
  color: var(--muted);
  font: 10px/1.5 var(--font-body);
}

.sidebar-section-label {
  margin: 42px 10px 13px;
  color: var(--muted);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .18em;
}

.primary-nav {
  display: grid;
  gap: 7px;
}

.nav-link {
  position: relative;
  display: flex;
  min-height: 61px;
  align-items: center;
  gap: 10px;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--muted);
  transition: transform .18s ease, background .18s ease, color .18s ease, border-color .18s ease;
}

.nav-link-icon {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 11px;
  color: var(--text-soft);
  background: var(--surface);
  transition: color .18s ease, background .18s ease, border-color .18s ease;
}

.nav-link-icon svg {
  flex: 0 0 auto;
}

.nav-link-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.nav-link-copy > span {
  color: inherit;
  font-size: 11px;
  font-weight: 600;
}

.nav-link-copy small {
  overflow: hidden;
  color: var(--muted);
  font-size: 9px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-link-arrow {
  margin-left: auto;
  color: var(--accent);
  font-size: 13px;
  opacity: 0;
  transform: translateX(-3px);
  transition: opacity .18s ease, transform .18s ease;
}

.nav-link:hover {
  transform: translateX(2px);
  color: var(--text);
  background: var(--surface-soft);
}

.nav-link:hover .nav-link-arrow,
.nav-link-active .nav-link-arrow {
  opacity: 1;
  transform: translateX(0);
}

.nav-link-active {
  border-color: color-mix(in srgb, var(--accent) 17%, var(--border));
  color: var(--accent) !important;
  background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 7%, transparent);
}

.nav-link-active::before {
  position: absolute;
  inset: 14px auto 14px -19px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
  content: '';
}

.nav-link-active .nav-link-icon {
  border-color: color-mix(in srgb, var(--accent) 20%, transparent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
}

.sidebar-note {
  position: relative;
  margin: auto 2px 13px;
  padding: 15px 13px 14px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
}

.sidebar-note::after {
  position: absolute;
  right: -14px;
  bottom: -27px;
  width: 68px;
  height: 68px;
  border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
  border-radius: 50%;
  content: '';
}

.sidebar-note-mark {
  display: grid;
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
  place-items: center;
  border-radius: 8px;
  color: var(--accent);
  background: var(--surface);
  font-size: 12px;
}

.sidebar-note p {
  max-width: 150px;
  margin: 0;
  color: var(--text-soft);
  font: 11px/1.55 var(--font-title);
}

.sidebar-note strong {
  color: var(--accent);
  font-weight: 600;
}

.sidebar-footer {
  display: grid;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.sidebar-profile {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 11px;
  transition: background .18s ease, border-color .18s ease;
}

.sidebar-profile:hover,
.sidebar-profile-active {
  border-color: color-mix(in srgb, var(--accent) 14%, var(--border));
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
}

.profile-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
  border-radius: 50%;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 15px var(--font-title);
}

.profile-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.profile-copy strong {
  overflow: hidden;
  color: var(--text);
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-copy small {
  overflow: hidden;
  color: var(--muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--muted);
}

.footer-action,
.theme-switch {
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  color: var(--text-soft);
  background: transparent;
  font-size: 10px;
  text-align: left;
  cursor: pointer;
  transition: color .18s ease, background .18s ease;
}

.footer-action svg,
.theme-switch-icon {
  flex: 0 0 auto;
  color: var(--muted);
}

.footer-action:hover,
.theme-switch:hover {
  color: var(--text);
  background: var(--surface-soft);
}

.footer-action-active {
  color: var(--accent);
  background: var(--accent-soft);
}

.footer-action-active svg,
.theme-switch-icon {
  color: var(--accent);
}

.switch-track {
  display: flex;
  width: 29px;
  height: 16px;
  flex: 0 0 auto;
  align-items: center;
  margin-left: auto;
  padding: 2px;
  border-radius: 10px;
  background: var(--border);
  transition: background .2s ease;
}

.switch-track i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 1px 3px rgb(0 0 0 / 16%);
  transition: transform .2s ease;
}

.switch-track.switch-on {
  background: var(--accent);
}

.switch-track.switch-on i {
  transform: translateX(13px);
}

@media (max-width: 720px) {
  .sidebar {
    position: static;
    width: auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 13px 17px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .brand {
    padding: 0;
  }

  .brand-caption,
  .sidebar-note {
    display: none;
  }

  .brand-mark {
    width: 34px;
    height: 34px;
  }

  .brand-mark svg {
    width: 24px;
    height: 24px;
  }

  .brand-word {
    font-size: 20px;
  }

  .sidebar-section-label {
    display: none;
  }

  .primary-nav {
    order: 2;
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }

  .nav-link {
    min-height: 41px;
    flex: 1;
    justify-content: center;
    gap: 6px;
    padding: 4px 5px;
    border-radius: 9px;
  }

  .nav-link-icon {
    width: 25px;
    height: 25px;
    border: 0;
    border-radius: 7px;
    background: transparent;
  }

  .nav-link-icon svg {
    width: 16px;
    height: 16px;
  }

  .nav-link-copy {
    display: block;
    min-width: 0;
  }

  .nav-link-copy > span {
    overflow: hidden;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-link-copy small,
  .nav-link-arrow {
    display: none;
  }

  .nav-link-active::before {
    inset: auto 25% -1px;
    width: 50%;
    height: 2px;
    border-radius: 2px 2px 0 0;
  }

  .nav-link-active .nav-link-icon {
    background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  }

  .sidebar-footer {
    order: 3;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    margin-top: 9px;
    padding-top: 8px;
  }

  .sidebar-profile {
    min-height: 36px;
    justify-content: center;
    gap: 5px;
    padding: 4px;
  }

  .profile-avatar {
    width: 23px;
    height: 23px;
    font-size: 11px;
  }

  .profile-copy {
    display: block;
  }

  .profile-copy strong,
  .footer-action,
  .theme-switch {
    font-size: 9px;
  }

  .profile-copy small,
  .profile-arrow {
    display: none;
  }

  .footer-action,
  .theme-switch {
    min-height: 36px;
    justify-content: center;
    gap: 5px;
    padding: 4px;
  }

  .theme-switch > span:nth-child(2) {
    display: none;
  }
}
</style>
