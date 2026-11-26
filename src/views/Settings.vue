<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage, getSupabase } from '@/lib/supabase.js';
import { currentTheme, setTheme } from '@/lib/theme.js';

const router = useRouter();
const profileName = ref('');
const email = ref('');
const isLoading = ref(true);
const isSaving = ref(false);
const isChangingPassword = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const passwordErrorMessage = ref('');
const passwordSuccessMessage = ref('');
const initials = computed(() => profileName.value.trim().charAt(0).toLocaleUpperCase('pt-BR') || '•');
const isDarkTheme = computed(() => currentTheme.value === 'dark');

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

async function changePassword() {
  passwordErrorMessage.value = '';
  passwordSuccessMessage.value = '';

  if (password.value.length < 6) {
    passwordErrorMessage.value = 'A nova senha precisa ter pelo menos 6 caracteres.';
    return;
  }
  if (password.value !== passwordConfirmation.value) {
    passwordErrorMessage.value = 'As senhas não coincidem.';
    return;
  }

  isChangingPassword.value = true;
  try {
    const { error } = await getSupabase().auth.updateUser({ password: password.value });
    if (error) throw error;

    password.value = '';
    passwordConfirmation.value = '';
    passwordSuccessMessage.value = 'Senha alterada com sucesso.';
  } catch (error) {
    passwordErrorMessage.value = getErrorMessage(error);
  } finally {
    isChangingPassword.value = false;
  }
}

function chooseTheme(theme) {
  setTheme(theme);
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
      <div>
        <p class="page-eyebrow">Seu espaço, do seu jeito</p>
        <h1>Configurações</h1>
        <p>Cuide das informações da sua conta e personalize sua experiência de estudo.</p>
      </div>
      <span class="settings-header-mark" aria-hidden="true">✦</span>
    </header>
    <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>

    <div class="settings-grid">
      <section class="settings-card profile-card" aria-labelledby="profile-title">
        <div class="profile-heading">
          <span class="profile-avatar" aria-hidden="true">{{ initials }}</span>
          <div class="profile-heading-copy">
            <p class="page-eyebrow">Conta conectada</p>
            <h2 id="profile-title">Meu perfil</h2>
            <p class="profile-email">{{ email || 'Carregando conta...' }}</p>
          </div>
        </div>
        <form class="profile-form" @submit.prevent="saveProfile">
          <label for="profile-name">Nome completo</label>
          <input id="profile-name" v-model="profileName" maxlength="120" required :disabled="isLoading" />
          <p v-if="successMessage" class="success-message" role="status">{{ successMessage }}</p>
          <div class="settings-card-actions">
            <button class="primary-button" type="submit" :disabled="isSaving || isLoading">
              {{ isSaving ? 'Salvando...' : 'Salvar perfil' }}
            </button>
            <button class="sign-out-button" type="button" @click="signOut">Sair da conta</button>
          </div>
        </form>
      </section>

      <section class="settings-card password-card" aria-labelledby="password-title">
        <div class="card-heading">
          <span class="card-heading-icon password-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="8.5" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6.5 8.5V6a3.5 3.5 0 1 1 7 0v2.5M10 11.5v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <div>
            <p class="page-eyebrow">Segurança</p>
            <h2 id="password-title">Trocar senha</h2>
          </div>
        </div>
        <p class="card-description">Escolha uma senha nova para proteger sua conta.</p>
        <form class="password-form" @submit.prevent="changePassword">
          <label for="new-password">Nova senha</label>
          <input
            id="new-password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            :disabled="isChangingPassword"
          />
          <label for="confirm-password">Confirme a nova senha</label>
          <input
            id="confirm-password"
            v-model="passwordConfirmation"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            :disabled="isChangingPassword"
          />
          <p v-if="passwordErrorMessage" class="form-message error-message" role="alert">
            {{ passwordErrorMessage }}
          </p>
          <p v-if="passwordSuccessMessage" class="form-message success-message" role="status">
            {{ passwordSuccessMessage }}
          </p>
          <button class="primary-button" type="submit" :disabled="isChangingPassword">
            {{ isChangingPassword ? 'Atualizando...' : 'Atualizar senha' }}
          </button>
        </form>
      </section>

      <section class="settings-card appearance-card" aria-labelledby="appearance-title">
        <div class="appearance-heading">
          <div class="card-heading">
            <span class="card-heading-icon appearance-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 3.5a6.5 6.5 0 0 1 0 13V3.5Z" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </span>
            <div>
              <p class="page-eyebrow">Personalização</p>
              <h2 id="appearance-title">Aparência</h2>
            </div>
          </div>
          <span class="appearance-saved">Preferência salva neste dispositivo</span>
        </div>
        <p class="card-description">Escolha o tema que deixa seus estudos mais confortáveis.</p>
        <div class="theme-options" role="group" aria-label="Tema da aparência">
          <button
            class="theme-option"
            :class="{ selected: !isDarkTheme }"
            type="button"
            :aria-pressed="!isDarkTheme"
            @click="chooseTheme('light')"
          >
            <span class="theme-preview light-preview" aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
            <span class="theme-option-copy">
              <strong>Claro</strong>
              <small>Visual leve para o dia</small>
            </span>
            <span class="theme-radio" aria-hidden="true"></span>
          </button>
          <button
            class="theme-option"
            :class="{ selected: isDarkTheme }"
            type="button"
            :aria-pressed="isDarkTheme"
            @click="chooseTheme('dark')"
          >
            <span class="theme-preview dark-preview" aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
            <span class="theme-option-copy">
              <strong>Escuro</strong>
              <small>Mais conforto à noite</small>
            </span>
            <span class="theme-radio" aria-hidden="true"></span>
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.settings-page {
  display: grid;
  gap: 20px;
}

.settings-header {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 27px 32px;
  border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
  border-radius: 17px;
  background:
    radial-gradient(ellipse at 87% 45%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 38%),
    linear-gradient(115deg, color-mix(in srgb, var(--accent-soft) 62%, var(--surface)), var(--surface) 75%);
  box-shadow: var(--shadow-card);
}

.settings-header .page-eyebrow {
  margin: 0;
}

.settings-header h1 {
  margin: 8px 0 5px;
  color: var(--text);
  font: 500 clamp(30px, 3.5vw, 40px)/1.15 var(--font-title);
  letter-spacing: -.04em;
}

.settings-header > p:last-child {
  margin: 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.7;
}

.settings-header-mark {
  display: grid;
  width: 68px;
  height: 68px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border));
  border-radius: 22px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  font-size: 30px;
  transform: rotate(8deg);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.settings-card {
  min-width: 0;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.settings-card h2 {
  margin: 4px 0 0;
  color: var(--text);
  font: 500 20px var(--font-title);
}

.settings-card .page-eyebrow {
  margin: 0;
}

.profile-heading {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-heading-copy {
  min-width: 0;
}

.profile-avatar {
  display: grid;
  width: 54px;
  height: 54px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
  border-radius: 17px;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 21px var(--font-title);
}

.profile-email {
  overflow: hidden;
  margin: 5px 0 0;
  color: var(--text-soft);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-form,
.password-form {
  display: grid;
  gap: 9px;
  margin-top: 22px;
}

.profile-form label,
.password-form label {
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.profile-form input,
.password-form input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: var(--bg);
  font-size: 12px;
}

.profile-form input:focus,
.password-form input:focus {
  border-color: var(--accent);
  outline: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}

.settings-card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin-top: 4px;
}

.sign-out-button {
  min-height: 40px;
  padding: 0 10px;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.sign-out-button:hover {
  color: #b54747;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.card-heading-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
}

.password-icon {
  color: #a56d83;
  background: color-mix(in srgb, #a56d83 11%, var(--surface));
}

.appearance-icon {
  color: var(--accent);
  background: var(--accent-soft);
}

.card-description {
  margin: 14px 0 0;
  color: var(--text-soft);
  font-size: 10px;
  line-height: 1.6;
}

.password-form {
  margin-top: 16px;
}

.password-form .primary-button {
  justify-self: start;
  margin-top: 4px;
}

.form-message {
  margin: 2px 0;
  font-size: 10px;
  line-height: 1.5;
}

.error-message {
  color: #b54747;
}

.success-message {
  color: #397c55;
}

.appearance-card {
  grid-column: 1 / -1;
}

.appearance-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.appearance-saved {
  color: var(--muted);
  font-size: 9px;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.theme-option {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  background: var(--surface);
  text-align: left;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}

.theme-option:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent) 38%, var(--border));
}

.theme-option.selected {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
  background: color-mix(in srgb, var(--accent) 4%, var(--surface));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 8%, transparent);
}

.theme-preview {
  display: grid;
  width: 54px;
  height: 40px;
  flex: 0 0 auto;
  align-content: center;
  gap: 4px;
  padding: 7px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.theme-preview i {
  display: block;
  width: 70%;
  height: 4px;
  border-radius: 4px;
}

.theme-preview i:nth-child(2) {
  width: 88%;
}

.theme-preview i:nth-child(3) {
  width: 52%;
}

.light-preview {
  background: #f7f6fb;
}

.light-preview i {
  background: #d7d3e8;
}

.light-preview i:first-child {
  background: #8076c5;
}

.dark-preview {
  background: #1c1c2a;
}

.dark-preview i {
  background: #55556c;
}

.dark-preview i:first-child {
  background: #a49af2;
}

.theme-option-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.theme-option-copy strong {
  color: var(--text);
  font: 600 11px var(--font-title);
}

.theme-option-copy small {
  color: var(--muted);
  font-size: 9px;
}

.theme-radio {
  display: grid;
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  place-items: center;
  margin-left: auto;
  border: 1px solid var(--border);
  border-radius: 50%;
}

.theme-option.selected .theme-radio {
  border-color: var(--accent);
}

.theme-option.selected .theme-radio::after {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  content: '';
}

@media (max-width: 850px) {
  .settings-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .appearance-card {
    grid-column: auto;
  }
}

@media (max-width: 480px) {
  .settings-page {
    gap: 15px;
  }

  .settings-header {
    min-height: 0;
    padding: 22px 19px;
  }

  .settings-header-mark {
    width: 47px;
    height: 47px;
    border-radius: 15px;
    font-size: 22px;
  }

  .settings-header > div > p:last-child {
    max-width: 310px;
    font-size: 10px;
  }

  .settings-card {
    padding: 18px;
  }

  .appearance-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .theme-options {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
