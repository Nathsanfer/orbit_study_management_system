import { ref } from 'vue';

export const currentTheme = ref('light');

export function initializeTheme() {
  const savedTheme = localStorage.getItem('orbit-theme');
  currentTheme.value = savedTheme
    ? savedTheme === 'dark' ? 'dark' : 'light'
    : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme.value);
}

export function setTheme(theme) {
  currentTheme.value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme.value);
  localStorage.setItem('orbit-theme', currentTheme.value);
}
