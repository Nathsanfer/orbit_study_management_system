<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, supabase, supabaseConfigError } from '@/lib/supabase.js';

const route = useRoute();
const router = useRouter();
const isSignUp = ref(false);
const fullName = ref('');
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

onMounted(async () => {
  if (route.query.authError === 'session') {
    errorMessage.value = 'Não foi possível validar sua sessão. Entre novamente.';
  }
  if (!supabase) return;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      errorMessage.value = getErrorMessage(error);
      return;
    }
    if (data.session) router.replace({ name: 'home' });
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
});

async function submit() {
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  try {
    if (isSignUp.value) {
      const { data, error } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: { data: { nome_completo: fullName.value.trim() } },
      });
      if (error) throw error;

      if (!data.session) {
        successMessage.value = 'Cadastro criado. Confirme seu e-mail para entrar na sua conta.';
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value,
      });
      if (error) throw error;
    }

    router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : { name: 'home' });
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
      <p class="page-eyebrow">Orbit Study</p>
      <h1>{{ isSignUp ? 'Crie sua conta' : 'Bem-vinda de volta' }}</h1>
      <p class="auth-description">Entre para acessar e salvar seus dados de estudo.</p>

      <p v-if="supabaseConfigError" class="form-message error" role="alert">{{ supabaseConfigError }}</p>
      <form v-else class="auth-form" @submit.prevent="submit">
        <label v-if="isSignUp" for="full-name">Nome completo</label>
        <input
          v-if="isSignUp"
          id="full-name"
          v-model="fullName"
          type="text"
          autocomplete="name"
          maxlength="120"
          required
        />
        <label for="email">E-mail</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required />
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :autocomplete="isSignUp ? 'new-password' : 'current-password'"
          minlength="6"
          required
        />
        <p v-if="errorMessage" class="form-message error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="form-message success" role="status">{{ successMessage }}</p>
        <button class="primary-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar' }}
        </button>
      </form>

      <button
        v-if="!supabaseConfigError"
        class="mode-toggle"
        type="button"
        @click="isSignUp = !isSignUp; errorMessage = ''; successMessage = ''"
      >
        {{ isSignUp ? 'Já tem conta? Entrar' : 'Ainda não tem conta? Cadastre-se' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: calc(100vh - 82px);
  place-items: center;
}

.auth-card {
  width: min(100%, 430px);
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.auth-card h1 {
  margin: 8px 0;
  color: var(--text);
  font: 500 30px/1.2 var(--font-title);
}

.auth-description {
  margin: 0 0 22px;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.auth-form {
  display: grid;
  gap: 9px;
}

.auth-form label {
  margin-top: 5px;
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.auth-form input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font-size: 12px;
}

.auth-form .primary-button {
  width: 100%;
  margin-top: 9px;
}

.primary-button:disabled {
  cursor: wait;
  opacity: .7;
}

.form-message {
  margin: 5px 0;
  font-size: 11px;
  line-height: 1.5;
}

.error {
  color: #b54141;
}

.success {
  color: #397c55;
}

.mode-toggle {
  width: 100%;
  margin-top: 19px;
  padding: 8px;
  border: 0;
  color: var(--accent);
  background: transparent;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
</style>
