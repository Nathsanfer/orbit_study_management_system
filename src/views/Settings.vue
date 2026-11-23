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
    <header class="settings-header">
      <p class="page-eyebrow">Preferências e conta</p>
      <h1>Configurações</h1>
      <p>Gerencie seus dados de perfil e as preferências do seu espaço.</p>
    </header>
    <div class="settings-grid">
      <section class="settings-card profile-card" aria-labelledby="profile-title">
        <div class="profile-heading">
          <span class="profile-avatar" aria-hidden="true">E</span>
          <div>
            <p class="page-eyebrow">Conta de demonstração</p>
            <h2 id="profile-title">Meu perfil</h2>
            <p>Estudante Orbit</p>
          </div>
        </div>
        <div class="profile-note">
          Seu espaço pessoal está pronto. Os dados da conta poderão ser conectados quando
          o Orbit receber autenticação.
        </div>
      </section>

      <section class="settings-card preferences-card" aria-labelledby="preferences-title">
        <p class="page-eyebrow">Preferências</p>
        <h2 id="preferences-title">Aparência</h2>
        <p>Alterne entre os temas claro e escuro pelo controle no menu lateral.</p>
        <RouterLink class="primary-button" :to="{ name: 'subjects' }">Voltar às matérias</RouterLink>
      </section>
    </div>
  </section>
</template>

<style scoped>
.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  margin: 8px 0;
  color: var(--text);
  font: 500 34px var(--font-title);
}

.settings-header > p:last-child {
  margin: 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.7;
}

.settings-grid {
  display: grid;
  max-width: 900px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.settings-card {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.settings-card h2 {
  margin: 8px 0;
  color: var(--text);
  font: 500 24px var(--font-title);
}

.settings-card p {
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.7;
}

.profile-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}

.profile-heading .page-eyebrow {
  margin: 0;
}

.profile-heading h2 {
  margin: 5px 0 3px;
}

.profile-heading p:last-child {
  margin: 0;
  font-size: 11px;
}

.profile-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
  border-radius: 50%;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 20px var(--font-title);
}

.profile-note {
  margin-top: 20px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 11px;
  line-height: 1.65;
}

.preferences-card > p:not(.page-eyebrow) {
  margin: 8px 0 18px;
}

@media (max-width: 650px) {
  .settings-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
