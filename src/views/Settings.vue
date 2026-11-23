<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="settings-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Configurações</span>
    </nav>
    <div class="settings-card">
      <p class="page-eyebrow">Preferências</p>
      <h1>Configurações</h1>
      <p>Alterne entre os temas claro e escuro pelo controle no menu lateral.</p>
      <RouterLink class="primary-button" :to="{ name: 'subjects' }">Voltar às matérias</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.settings-card {
  max-width: 620px;
  padding: 25px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
}

.settings-card h1 {
  margin: 8px 0;
  color: var(--text);
  font: 500 34px var(--font-title);
}

.settings-card p {
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.7;
}
</style>
