<script setup>
import { computed, ref, watch } from 'vue';
import { loadStudySessions } from '@/data/study.js';
import { getErrorMessage } from '@/lib/supabase.js';
import { getSubjectIcon } from '@/lib/icons.js';

const weekOffset = ref(0);
const selectedDate = ref(new Date());
const sessions = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

const weekdayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const fullWeekdayNames = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];

function getWeekStart(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + offset * 7);
  return date;
}

function formatWeekRange(startDate, endDate) {
  const start = startDate.toLocaleDateString('pt-BR', { day: 'numeric' });
  const end = endDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${start} – ${end}`;
}

const weekDays = computed(() => {
  const firstDay = getWeekStart(weekOffset.value);
  return weekdayNames.map((label, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    return {
      label,
      fullLabel: fullWeekdayNames[index],
      date,
      weekday: date.getDay(),
    };
  });
});

async function loadWeekSessions() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const start = weekDays.value[0].date;
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    sessions.value = await loadStudySessions(start, end);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

watch(weekOffset, loadWeekSessions, { immediate: true });

const weekRange = computed(() =>
  formatWeekRange(weekDays.value[0].date, weekDays.value[6].date),
);

const selectedDayLabel = computed(() => {
  const label = selectedDate.value.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toLocaleUpperCase('pt-BR') + label.slice(1);
});

const daySessions = computed(() =>
  sessions.value.filter((session) =>
    session.startedAt.toDateString() === selectedDate.value.toDateString(),
  ),
);

const weeklyMinutes = computed(() => sessions.value.reduce((total, session) => total + session.minutes, 0));
const weeklyHours = computed(() => (weeklyMinutes.value / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 }));
const weeklyDuration = computed(() => `${weeklyHours.value} horas registradas`);
const sessionTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
function getSessionEnd(session) {
  const end = session.endedAt ?? new Date(session.startedAt.getTime() + session.minutes * 60_000);
  return sessionTime(end);
}

function selectDay(day) {
  selectedDate.value = new Date(day.date);
}

function changeWeek(offset) {
  weekOffset.value += offset;
  selectedDate.value = getWeekStart(weekOffset.value);
}

function goToCurrentWeek() {
  weekOffset.value = 0;
  selectedDate.value = new Date();
}
</script>

<template>
  <section class="schedule-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Cronograma</span>
    </nav>

    <header class="schedule-header">
      <div>
        <p class="page-eyebrow">Organize seu ritmo</p>
        <h1 class="schedule-title">Cronograma de estudos</h1>
        <p class="schedule-subtitle">Uma semana bem cuidada começa com um plano possível.</p>
      </div>
      <div class="week-controls" aria-label="Navegar entre semanas">
        <button class="week-arrow" type="button" aria-label="Semana anterior" @click="changeWeek(-1)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m10 3-5 5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="week-range">{{ weekRange }}</span>
        <button class="week-arrow" type="button" aria-label="Próxima semana" @click="changeWeek(1)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="today-button" type="button" @click="goToCurrentWeek">Hoje</button>
      </div>
    </header>

    <section class="week-summary" aria-label="Resumo da semana">
      <div>
        <span class="summary-label">Seu ritmo nesta semana</span>
        <strong>{{ sessions.length }} sessões <span>registradas</span></strong>
      </div>
      <div class="summary-decoration" aria-hidden="true">✦</div>
      <div class="summary-hours">
        <span class="summary-label">Tempo registrado</span>
        <strong>{{ weeklyDuration }}</strong>
      </div>
    </section>

    <div class="week-strip" role="group" aria-label="Escolha um dia da semana">
      <button
        v-for="day in weekDays"
        :key="day.date.toISOString()"
        class="day-button"
        :class="{ 'day-button-active': day.date.toDateString() === selectedDate.toDateString() }"
        type="button"
        :aria-label="`${day.fullLabel}, ${day.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`"
        :aria-pressed="day.date.toDateString() === selectedDate.toDateString()"
        @click="selectDay(day)"
      >
        <span>{{ day.label }}</span>
        <strong>{{ day.date.getDate() }}</strong>
        <i v-if="sessions.some((session) => session.startedAt.toDateString() === day.date.toDateString())" aria-hidden="true"></i>
      </button>
    </div>

    <section class="day-agenda">
      <div class="agenda-heading">
        <div>
          <p class="page-eyebrow">Sessões do dia</p>
          <h2>{{ selectedDayLabel }}</h2>
        </div>
        <span class="agenda-count">
          {{ daySessions.length }} {{ daySessions.length === 1 ? 'sessão' : 'sessões' }}
        </span>
      </div>

      <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>
      <div v-if="isLoading" class="empty-state" role="status">Carregando sessões...</div>
      <div v-else-if="errorMessage" class="empty-state">Não foi possível carregar as sessões.</div>

      <div v-else-if="daySessions.length" class="session-list">
        <article
          v-for="session in daySessions"
          :key="session.id"
          class="session-card"
          :style="{ '--subject-color': session.subject.color }"
        >
          <div class="session-time">
            <strong>{{ sessionTime(session.startedAt) }}</strong>
            <span>{{ getSessionEnd(session) }}</span>
          </div>
          <div class="session-subject-mark" aria-hidden="true">
            <component :is="getSubjectIcon(session.subject.icon)" :size="21" :stroke-width="1.7" />
          </div>
          <div class="session-copy">
            <span class="session-subject">{{ session.subject.name }}</span>
            <h3>{{ session.topic }}</h3>
            <span class="session-duration">{{ session.minutes }} min · {{ session.status.replaceAll('_', ' ') }}</span>
          </div>
          <span class="session-arrow" aria-hidden="true">→</span>
        </article>
      </div>

      <div v-else class="rest-card">
        <span class="rest-mark" aria-hidden="true">☼</span>
        <div>
          <h3>Nenhuma sessão registrada</h3>
          <p>As sessões salvas no seu banco aparecerão aqui.</p>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.schedule-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 27px;
}

.schedule-title {
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(31px, 3.2vw, 42px)/1.15 var(--font-title);
  letter-spacing: -.035em;
}

.schedule-subtitle {
  margin: 9px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.week-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface);
}

.week-arrow,
.today-button {
  display: grid;
  min-width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: var(--text-soft);
  background: transparent;
  cursor: pointer;
  transition: color .18s ease, background .18s ease;
}

.week-arrow:hover,
.today-button:hover {
  color: var(--accent);
  background: var(--accent-soft);
}

.week-range {
  min-width: 130px;
  color: var(--text);
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}

.today-button {
  display: block;
  min-width: 43px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 600;
}

.week-summary {
  position: relative;
  display: flex;
  min-height: 96px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  margin-bottom: 20px;
  padding: 19px 24px;
  border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
}

.summary-label {
  display: block;
  margin-bottom: 7px;
  color: var(--muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.week-summary strong {
  color: var(--text);
  font: 500 22px var(--font-title);
}

.week-summary strong span {
  color: var(--text-soft);
  font: 400 11px var(--font-body);
}

.summary-decoration {
  position: absolute;
  left: 50%;
  color: color-mix(in srgb, var(--accent) 25%, transparent);
  font-size: 25px;
  transform: translateX(-50%);
}

.summary-hours {
  text-align: right;
}

.week-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 32px;
}

.day-button {
  position: relative;
  display: grid;
  min-height: 83px;
  justify-items: center;
  align-content: center;
  gap: 7px;
  border: 1px solid var(--border);
  border-radius: 11px;
  color: var(--muted);
  background: var(--surface);
  cursor: pointer;
  transition: transform .18s ease, border-color .18s ease, background .18s ease, color .18s ease;
}

.day-button:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}

.day-button > span {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
}

.day-button strong {
  color: var(--text);
  font: 500 19px var(--font-title);
}

.day-button i {
  position: absolute;
  bottom: 7px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--c-lavender);
}

.day-button-active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent);
  box-shadow: 0 7px 16px color-mix(in srgb, var(--accent) 20%, transparent);
}

.day-button-active > span,
.day-button-active strong {
  color: #fffafc;
}

.day-button-active i {
  background: #fffafc;
}

:global(:root[data-theme='dark']) .day-button-active > span,
:global(:root[data-theme='dark']) .day-button-active strong {
  color: #241a20;
}

:global(:root[data-theme='dark']) .day-button-active i {
  background: #241a20;
}

.agenda-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.agenda-heading .page-eyebrow {
  margin: 0;
}

.agenda-heading h2 {
  margin: 6px 0 0;
  color: var(--text);
  font: 500 25px var(--font-title);
  text-transform: capitalize;
}

.agenda-count {
  padding: 6px 10px;
  border-radius: 20px;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 9px;
}

.session-list {
  display: grid;
  gap: 10px;
}

.session-card {
  display: flex;
  min-height: 89px;
  align-items: center;
  gap: 16px;
  padding: 15px 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition: transform .18s ease, border-color .18s ease;
}

.session-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--subject-color) 38%, var(--border));
}

.session-time {
  display: grid;
  min-width: 52px;
  gap: 4px;
}

.session-time strong {
  color: var(--text);
  font-size: 11px;
  font-weight: 600;
}

.session-time span {
  color: var(--muted);
  font-size: 9px;
}

.session-subject-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, transparent);
  border-radius: 12px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 11%, var(--surface));
  font: 600 17px var(--font-title);
}

.session-copy {
  min-width: 0;
  flex: 1;
}

.session-subject {
  color: var(--subject-color);
  font-size: 9px;
  font-weight: 600;
}

.session-copy h3 {
  overflow: hidden;
  margin: 4px 0;
  color: var(--text);
  font: 500 16px var(--font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-duration {
  color: var(--muted);
  font-size: 9px;
}

.session-arrow {
  color: var(--muted);
  font-size: 16px;
}

.rest-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 104px;
  padding: 20px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.rest-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  color: #a47752;
  background: #f7eee3;
  font-size: 20px;
}

.rest-card h3 {
  margin: 0 0 5px;
  color: var(--text);
  font: 500 17px var(--font-title);
}

.rest-card p {
  margin: 0;
  color: var(--text-soft);
  font-size: 10px;
  line-height: 1.6;
}

@media (max-width: 1050px) {
  .schedule-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  .week-strip {
    gap: 6px;
    overflow-x: auto;
    padding: 2px 2px 8px;
  }

  .day-button {
    min-width: 48px;
    min-height: 74px;
  }

  .session-card {
    gap: 11px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .schedule-header {
    gap: 17px;
  }

  .schedule-title {
    font-size: 32px;
  }

  .week-controls {
    width: 100%;
    justify-content: space-between;
  }

  .week-range {
    min-width: 0;
    flex: 1;
  }

  .week-summary {
    min-height: 83px;
    padding: 15px;
  }

  .week-summary strong {
    font-size: 19px;
  }

  .summary-label {
    font-size: 8px;
  }

  .summary-decoration {
    display: none;
  }

  .session-time {
    min-width: 45px;
  }

  .session-subject-mark {
    width: 36px;
    height: 36px;
  }
}
</style>
