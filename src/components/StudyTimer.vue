<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  finishTopicSession,
  loadCurrentTopicSession,
  pauseTopicSession,
  resumeTopicSession,
  startTopicSession,
} from '@/data/topic-sessions.js';
import { getErrorMessage } from '@/lib/supabase.js';

const props = defineProps({
  topicId: {
    type: [String, Number],
    required: true,
  },
});

const session = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const noticeMessage = ref('');
const lastCompletedSeconds = ref(0);
const storedElapsedSeconds = ref(0);
const activeSegmentStart = ref(null);
const currentTime = ref(Date.now());
let ticker;
let loadSequence = 0;

const elapsedSeconds = computed(() => {
  const activeSession = session.value;
  if (!activeSession) return lastCompletedSeconds.value;
  if (isPaused.value) {
    return storedElapsedSeconds.value;
  }

  const segmentStart = Date.parse(activeSegmentStart.value || activeSession.data_inicio);
  const liveSeconds = Number.isFinite(segmentStart)
    ? Math.max(0, Math.floor((currentTime.value - segmentStart) / 1000))
    : 0;
  return storedElapsedSeconds.value + liveSeconds;
});

const timerDisplay = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600);
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60);
  const seconds = elapsedSeconds.value % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
});

const isPaused = computed(() => session.value?.status === 'pausada');

watch(() => props.topicId, loadSession, { immediate: true });

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker);
});

async function loadSession() {
  const sequence = ++loadSequence;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const savedSession = await loadCurrentTopicSession(props.topicId);
    if (sequence !== loadSequence) return;
    session.value = savedSession;
    lastCompletedSeconds.value = 0;
    if (savedSession) {
      restoreTimerState(savedSession);
    } else {
      storedElapsedSeconds.value = 0;
      activeSegmentStart.value = null;
    }
  } catch (error) {
    if (sequence === loadSequence) errorMessage.value = getErrorMessage(error);
  } finally {
    if (sequence === loadSequence) isLoading.value = false;
  }
}

function storageKey(sessionId) {
  return `orbit-study-session-${sessionId}`;
}

function restoreTimerState(savedSession) {
  const databaseSeconds = Math.max(0, Number(savedSession.duracao) || 0) * 60;
  storedElapsedSeconds.value = databaseSeconds;
  activeSegmentStart.value = savedSession.status === 'em_andamento'
    ? savedSession.data_inicio
    : null;

  try {
    const rawState = window.localStorage.getItem(storageKey(savedSession.id));
    if (!rawState) return;

    const state = JSON.parse(rawState);
    const savedSeconds = Number(state.elapsedSeconds);
    if (!Number.isFinite(savedSeconds) || savedSeconds < databaseSeconds) return;

    storedElapsedSeconds.value = Math.floor(savedSeconds);
    if (
      savedSession.status === 'em_andamento'
      && typeof state.activeSegmentStart === 'string'
      && Number.isFinite(Date.parse(state.activeSegmentStart))
    ) {
      activeSegmentStart.value = state.activeSegmentStart;
    }
  } catch (error) {
    errorMessage.value = `Não foi possível recuperar os segundos extras desta sessão: ${getErrorMessage(error)}`;
  }
}

function persistTimerState(sessionId, elapsed, segmentStart) {
  try {
    window.localStorage.setItem(storageKey(sessionId), JSON.stringify({
      elapsedSeconds: Math.floor(elapsed),
      activeSegmentStart: segmentStart,
    }));
  } catch (error) {
    errorMessage.value = `A sessão foi salva no banco, mas não foi possível preservar os segundos extras: ${getErrorMessage(error)}`;
  }
}

function clearTimerState(sessionId) {
  try {
    window.localStorage.removeItem(storageKey(sessionId));
  } catch (error) {
    errorMessage.value = `A sessão foi finalizada, mas não foi possível limpar o estado local: ${getErrorMessage(error)}`;
  }
}

async function runAction(action) {
  if (isSaving.value) return false;

  errorMessage.value = '';
  noticeMessage.value = '';
  isSaving.value = true;
  try {
    session.value = await action();
    return true;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    return false;
  } finally {
    isSaving.value = false;
  }
}

async function start() {
  lastCompletedSeconds.value = 0;
  if (!await runAction(() => startTopicSession(props.topicId))) return;

  storedElapsedSeconds.value = 0;
  activeSegmentStart.value = session.value.data_inicio;
  persistTimerState(session.value.id, 0, activeSegmentStart.value);
}

async function pause() {
  if (!session.value) return;
  const elapsed = elapsedSeconds.value;
  const sessionId = session.value.id;
  if (!await runAction(() => pauseTopicSession(sessionId, elapsed))) return;

  storedElapsedSeconds.value = elapsed;
  activeSegmentStart.value = null;
  persistTimerState(sessionId, elapsed, null);
}

async function resume() {
  if (!session.value) return;
  const sessionId = session.value.id;
  const resumedAt = new Date().toISOString();
  if (!await runAction(() => resumeTopicSession(sessionId, resumedAt))) return;

  activeSegmentStart.value = resumedAt;
  persistTimerState(sessionId, storedElapsedSeconds.value, resumedAt);
}

async function finish() {
  const finalDuration = elapsedSeconds.value;
  if (!session.value || isSaving.value) return;

  errorMessage.value = '';
  noticeMessage.value = '';
  isSaving.value = true;
  const sessionId = session.value.id;
  try {
    await finishTopicSession(sessionId, finalDuration);
    session.value = null;
    lastCompletedSeconds.value = finalDuration;
    storedElapsedSeconds.value = 0;
    activeSegmentStart.value = null;
    clearTimerState(sessionId);
    noticeMessage.value = 'Sessão concluída e salva.';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isSaving.value = false;
  }
}

ticker = setInterval(() => {
  currentTime.value = Date.now();
}, 1000);
</script>

<template>
  <section class="study-timer" aria-label="Cronômetro de estudos">
    <div class="timer-heading">
      <span class="timer-mark" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="11" r="6.5" stroke="currentColor" stroke-width="1.4" />
          <path d="M8 2.5h4M10 4.5v2m0 4.5 2.5 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
      </span>
      <div>
        <p class="timer-eyebrow">Foco no agora</p>
        <h2>Cronômetro</h2>
      </div>
    </div>

    <p class="timer-display" role="timer" aria-live="off">{{ timerDisplay }}</p>
    <p class="timer-caption">
      {{ isLoading ? 'Recuperando sua sessão...' : isPaused ? 'Sessão pausada' : session ? 'Sessão em andamento' : 'Tempo de estudo neste tópico' }}
    </p>

    <p v-if="errorMessage" class="timer-message error" role="alert">{{ errorMessage }}</p>
    <p v-else-if="noticeMessage" class="timer-message success" role="status">{{ noticeMessage }}</p>

    <div class="timer-actions">
      <button
        v-if="!session"
        class="timer-primary"
        type="button"
        :disabled="isLoading || isSaving"
        @click="start"
      >
        {{ isSaving ? 'Iniciando...' : 'Iniciar' }}
      </button>
      <template v-else>
        <button
          v-if="isPaused"
          class="timer-primary"
          type="button"
          :disabled="isSaving"
          @click="resume"
        >
          {{ isSaving ? 'Continuando...' : 'Continuar' }}
        </button>
        <button
          v-else
          class="timer-secondary"
          type="button"
          :disabled="isSaving"
          @click="pause"
        >
          {{ isSaving ? 'Salvando...' : 'Pausar' }}
        </button>
        <button
          class="timer-finish"
          type="button"
          :disabled="isSaving"
          @click="finish"
        >
          Finalizar
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.study-timer {
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, var(--border));
  border-radius: 13px;
  background: color-mix(in srgb, var(--subject-color) 5%, var(--surface));
  box-shadow: var(--shadow-card);
}

.timer-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-mark {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 12%, var(--surface));
}

.timer-eyebrow {
  margin: 0 0 2px;
  color: var(--muted);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.timer-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 17px var(--font-title);
}

.timer-display {
  margin: 20px 0 4px;
  color: var(--subject-color);
  font: 500 clamp(29px, 3vw, 36px)/1 var(--font-title);
  font-variant-numeric: tabular-nums;
  letter-spacing: .035em;
  text-align: center;
}

.timer-caption {
  min-height: 14px;
  margin: 0;
  color: var(--muted);
  font-size: 9px;
  text-align: center;
}

.timer-actions {
  display: flex;
  gap: 8px;
  margin-top: 17px;
}

.timer-actions button {
  min-height: 36px;
  flex: 1;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
}

.timer-actions button:not(:disabled):hover {
  transform: translateY(-1px);
}

.timer-actions button:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.timer-primary {
  color: #fff;
  background: var(--accent);
}

.timer-primary:not(:disabled):hover {
  background: var(--accent-hover);
}

.timer-secondary {
  border-color: var(--border) !important;
  color: var(--text-soft);
  background: var(--surface);
}

.timer-finish {
  border-color: color-mix(in srgb, var(--subject-color) 28%, var(--border)) !important;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 8%, var(--surface));
}

.timer-message {
  margin: 11px 0 0;
  font-size: 9px;
  line-height: 1.5;
  text-align: center;
}

.timer-message.error {
  color: #b54747;
}

.timer-message.success {
  color: var(--subject-color);
}

:global(:root[data-theme='dark']) .timer-primary {
  color: #241a20;
}
</style>
