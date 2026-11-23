<template>
  <section class="profile-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Meu perfil</span>
    </nav>

    <div class="profile-card">
      <div class="profile-heading">
        <span class="profile-avatar" aria-hidden="true">E</span>
        <div>
          <p class="page-eyebrow">Conta de demonstração</p>
          <h1>Meu perfil</h1>
          <p>Estudante Orbit</p>
        </div>
      </div>
      <div class="profile-note">
        Seu espaço pessoal está pronto. Os dados da conta poderão ser conectados quando
        o Orbit receber autenticação.
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-card {
  max-width: 620px;
  padding: 25px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.profile-heading {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-avatar {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
  border-radius: 50%;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 21px var(--font-title);
}

.profile-heading h1 {
  margin: 5px 0 3px;
  color: var(--text);
  font: 500 32px/1.2 var(--font-title);
}

.profile-heading p:last-child {
  margin: 0;
  color: var(--text-soft);
  font-size: 11px;
}

.profile-note {
  margin-top: 23px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 12px;
  line-height: 1.65;
}
</style>
