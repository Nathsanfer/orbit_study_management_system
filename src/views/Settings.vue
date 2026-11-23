<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { getErrorMessage, getSupabase } from '@/lib/supabase.js';

const router = useRouter();
const profileName = ref('');
const email = ref('');
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const initials = computed(() => profileName.value.trim().charAt(0).toLocaleUpperCase('pt-BR') || '•');

onMounted(loadProfile);

async function loadProfile() {
  try {
    const client = getSupabase();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('Sua sessão expirou. Entre novamente.');

    email.value = userData.user.email ?? '';
    const { data, error } = await client
      .from('perfis')
      .select('nome_completo')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (error) throw error;

    profileName.value = data?.nome_completo
      ?? userData.user.user_metadata?.nome_completo
      ?? '';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

async function saveProfile() {
  errorMessage.value = '';
  successMessage.value = '';
  isSaving.value = true;
  try {
    const client = getSupabase();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('Sua sessão expirou. Entre novamente.');

    const { error } = await client
      .from('perfis')
      .upsert({ id: userData.user.id, nome_completo: profileName.value.trim() });
    if (error) throw error;
    successMessage.value = 'Perfil atualizado.';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isSaving.value = false;
  }
}

async function signOut() {
  errorMessage.value = '';
  try {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
    await router.replace({ name: 'auth' });
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
}
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
    <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>
    <div class="settings-grid">
      <section class="settings-card profile-card" aria-labelledby="profile-title">
        <div class="profile-heading">
          <span class="profile-avatar" aria-hidden="true">{{ initials }}</span>
          <div>
            <p class="page-eyebrow">Conta conectada</p>
            <h2 id="profile-title">Meu perfil</h2>
            <p>{{ email }}</p>
          </div>
        </div>
        <form class="profile-form" @submit.prevent="saveProfile">
          <label for="profile-name">Nome completo</label>
          <input id="profile-name" v-model="profileName" maxlength="120" required :disabled="isLoading" />
          <p v-if="successMessage" class="success-message" role="status">{{ successMessage }}</p>
          <button class="primary-button" type="submit" :disabled="isSaving || isLoading">
            {{ isSaving ? 'Salvando...' : 'Salvar perfil' }}
          </button>
        </form>
      </section>

      <section class="settings-card preferences-card" aria-labelledby="preferences-title">
        <p class="page-eyebrow">Preferências</p>
        <h2 id="preferences-title">Aparência</h2>
        <p>Alterne entre os temas claro e escuro pelo controle no menu lateral.</p>
        <RouterLink class="primary-button" :to="{ name: 'subjects' }">Voltar às matérias</RouterLink>
        <button class="secondary-button sign-out-button" type="button" @click="signOut">Sair da conta</button>
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

.profile-form {
  display: grid;
  gap: 9px;
  margin-top: 20px;
}

.profile-form label {
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.profile-form input {
  min-height: 40px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font-size: 11px;
}

.profile-form button,
.sign-out-button {
  justify-self: start;
}

.success-message {
  margin: 0;
  color: #397c55 !important;
  font-size: 10px !important;
}

.sign-out-button {
  margin-top: 10px;
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
