<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { loadEssays } from '@/data/essays.js';
import { loadStudySessions } from '@/data/study.js';
import { loadSubjects } from '@/data/subjects.js';
import { getErrorMessage, getSupabase } from '@/lib/supabase.js';

const isLoading = ref(true);
const errorMessage = ref('');
const subjects = ref([]);
const essays = ref([]);
const studyItems = ref([]);
const recentSessions = ref([]);

const totalTopics = computed(() =>
  subjects.value.reduce((total, subject) => total + subject.topics.length, 0),
);
const pendingItems = computed(() => studyItems.value.filter((item) => !item.done));
const completedItems = computed(() => studyItems.value.filter((item) => item.done).length);
const listProgress = computed(() => studyItems.value.length
  ? Math.round((completedItems.value / studyItems.value.length) * 100)
  : 0);
const subjectOverview = computed(() => [...subjects.value]
  .sort((first, second) => second.progress - first.progress)
  .slice(0, 4));
const weeklyStudyMinutes = computed(() =>
  recentSessions.value.reduce((total, session) => total + session.minutes, 0),
);

onMounted(loadDashboard);

async function loadDashboard() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [availableSubjects, availableEssays, sessions, itemResult] = await Promise.all([
      loadSubjects(),
      loadEssays(),
      loadStudySessions(weekStart, now),
      getSupabase()
        .from('itens_lista')
        .select('id,titulo,status,id_materia,materias(nome,cor)')
        .order('posicao'),
    ]);
    if (itemResult.error) throw itemResult.error;

    subjects.value = availableSubjects;
    essays.value = availableEssays;
    studyItems.value = (itemResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.titulo,
      done: item.status === 'concluido',
      subjectName: item.materias?.nome ?? '',
      subjectColor: item.materias?.cor
        || availableSubjects.find((subject) => subject.id === item.id_materia)?.color
        || '',
    }));
    recentSessions.value = sessions.slice().reverse();
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

function formatSessionDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
</script>

<template>
  <section class="home-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span aria-current="page">Seu espaço</span>
    </nav>

    <header class="home-hero">
      <div class="hero-copy">
        <p class="page-eyebrow"><span class="hero-eyebrow-mark" aria-hidden="true">✦</span> Seu espaço de aprendizado</p>
        <h1 class="home-title">Seus estudos, em órbita.</h1>
        <p class="home-copy">
          Um panorama do que você está aprendendo, do que vem a seguir e de cada passo que já conquistou.
        </p>
        <div class="hero-actions">
          <RouterLink class="primary-button" :to="{ name: 'subjects' }">
            Explorar matérias <span aria-hidden="true">→</span>
          </RouterLink>
          <RouterLink class="hero-secondary-link" :to="{ name: 'schedule' }">
            Abrir agenda <span aria-hidden="true">↗</span>
          </RouterLink>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="orbit orbit-outer"></span>
        <span class="orbit orbit-inner"></span>
        <span class="orbit-core"><span>O</span></span>
        <span class="orbit-spark orbit-spark-one">✦</span>
        <span class="orbit-spark orbit-spark-two">✧</span>
      </div>
    </header>

    <p v-if="errorMessage" class="request-error home-error" role="alert">
      Não foi possível carregar o panorama: {{ errorMessage }}
    </p>

    <section class="overview-stats" aria-label="Resumo dos seus estudos">
      <article class="overview-stat">
        <span class="stat-icon subject-stat-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H17v12H4.5A1.5 1.5 0 0 0 3 16.5v-12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M3 16.5A1.5 1.5 0 0 1 4.5 15H17M6.5 6.5h7M6.5 9.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <div>
          <strong>{{ isLoading ? '—' : subjects.length }}</strong>
          <span>Matérias</span>
        </div>
        <RouterLink :to="{ name: 'subjects' }" aria-label="Ver matérias">→</RouterLink>
      </article>
      <article class="overview-stat">
        <span class="stat-icon topic-stat-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="5" cy="5" r="1.5" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="5" cy="10" r="1.5" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="5" cy="15" r="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M9 5h7M9 10h7M9 15h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </span>
        <div>
          <strong>{{ isLoading ? '—' : totalTopics }}</strong>
          <span>Tópicos</span>
        </div>
        <RouterLink :to="{ name: 'subjects' }" aria-label="Ver tópicos">→</RouterLink>
      </article>
      <article class="overview-stat">
        <span class="stat-icon task-stat-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="3.5" y="3.5" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="m6.5 10 2.2 2.2 4.8-4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div>
          <strong>{{ isLoading ? '—' : pendingItems.length }}</strong>
          <span>Tarefas pendentes</span>
        </div>
        <RouterLink :to="{ name: 'study-list' }" aria-label="Ver lista de estudos">→</RouterLink>
      </article>
      <article class="overview-stat">
        <span class="stat-icon essay-stat-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5 3.5h7l3 3v10H5v-13Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M12 3.5v3h3M7.5 10h5M7.5 13h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </span>
        <div>
          <strong>{{ isLoading ? '—' : essays.length }}</strong>
          <span>Redações</span>
        </div>
        <RouterLink :to="{ name: 'essays' }" aria-label="Ver redações">→</RouterLink>
      </article>
    </section>

    <nav class="home-shortcuts" aria-label="Acessos rápidos">
      <RouterLink class="shortcut-link" :to="{ name: 'subjects' }">
        <span class="shortcut-icon" aria-hidden="true">01</span>
        <span><strong>Matérias</strong><small>Organize seus conteúdos</small></span>
        <span class="shortcut-arrow" aria-hidden="true">↗</span>
      </RouterLink>
      <RouterLink class="shortcut-link" :to="{ name: 'schedule' }">
        <span class="shortcut-icon" aria-hidden="true">02</span>
        <span><strong>Agenda</strong><small>Acompanhe suas sessões</small></span>
        <span class="shortcut-arrow" aria-hidden="true">↗</span>
      </RouterLink>
      <RouterLink class="shortcut-link" :to="{ name: 'study-list' }">
        <span class="shortcut-icon" aria-hidden="true">03</span>
        <span><strong>Lista de estudos</strong><small>{{ isLoading ? 'Seus próximos passos' : `${listProgress}% concluída` }}</small></span>
        <span class="shortcut-arrow" aria-hidden="true">↗</span>
      </RouterLink>
      <RouterLink class="shortcut-link" :to="{ name: 'essays' }">
        <span class="shortcut-icon" aria-hidden="true">04</span>
        <span><strong>Redações</strong><small>Escreva e acompanhe notas</small></span>
        <span class="shortcut-arrow" aria-hidden="true">↗</span>
      </RouterLink>
    </nav>

    <div class="home-dashboard">
      <div class="dashboard-column">
        <section class="dashboard-panel" aria-labelledby="subjects-overview-title">
          <div class="panel-heading">
            <div>
              <p class="page-eyebrow">Seu ritmo</p>
              <h2 id="subjects-overview-title">Progresso por matéria</h2>
            </div>
            <RouterLink class="panel-link" :to="{ name: 'subjects' }">Todas <span aria-hidden="true">→</span></RouterLink>
          </div>

          <div v-if="isLoading" class="panel-placeholder" role="status">Carregando matérias...</div>
          <div v-else-if="subjectOverview.length" class="subject-progress-list">
            <RouterLink
              v-for="subject in subjectOverview"
              :key="subject.id"
              class="subject-progress-row"
              :to="{ name: 'subject-detail', params: { id: subject.id } }"
              :style="{ '--subject-color': subject.color }"
            >
              <span class="subject-color-mark" aria-hidden="true"></span>
              <span class="subject-progress-copy">
                <strong>{{ subject.name }}</strong>
                <span>{{ subject.topics.length }} {{ subject.topics.length === 1 ? 'tópico' : 'tópicos' }}</span>
              </span>
              <span class="subject-progress-track" aria-label="Progresso da lista">
                <span :style="{ width: `${subject.progress}%` }"></span>
              </span>
              <strong class="subject-progress-value">{{ subject.progress }}%</strong>
            </RouterLink>
          </div>
          <div v-else class="panel-empty">
            <p>Cadastre uma matéria para começar a organizar seus estudos.</p>
            <RouterLink :to="{ name: 'subjects' }">Criar matéria <span aria-hidden="true">→</span></RouterLink>
          </div>
        </section>

        <section class="dashboard-panel activity-panel" aria-labelledby="activity-title">
          <div class="panel-heading">
            <div>
              <p class="page-eyebrow">Últimos 7 dias</p>
              <h2 id="activity-title">Atividade de estudo</h2>
            </div>
            <div class="weekly-time">
              <strong>{{ isLoading ? '—' : formatDuration(weeklyStudyMinutes) }}</strong>
              <span>de estudo</span>
            </div>
          </div>

          <div v-if="isLoading" class="panel-placeholder" role="status">Carregando atividade...</div>
          <div v-else-if="recentSessions.length" class="session-list">
            <article
              v-for="session in recentSessions.slice(0, 4)"
              :key="session.id"
              class="session-row"
              :style="{ '--subject-color': session.subject.color }"
            >
              <span class="session-mark" aria-hidden="true"></span>
              <div class="session-copy">
                <strong>{{ session.topic }}</strong>
                <span>{{ session.subject.name }}</span>
              </div>
              <time>{{ formatSessionDate(session.startedAt) }}</time>
              <span class="session-duration">{{ formatDuration(session.minutes) }}</span>
            </article>
          </div>
          <div v-else class="panel-empty">
            <p>Suas sessões recentes vão aparecer aqui.</p>
            <RouterLink :to="{ name: 'schedule' }">Ver agenda <span aria-hidden="true">→</span></RouterLink>
          </div>
        </section>
      </div>

      <div class="dashboard-column">
        <section class="dashboard-panel" aria-labelledby="tasks-title">
          <div class="panel-heading">
            <div>
              <p class="page-eyebrow">Para avançar</p>
              <h2 id="tasks-title">Próximos passos</h2>
            </div>
            <RouterLink class="panel-link" :to="{ name: 'study-list' }">Ver lista <span aria-hidden="true">→</span></RouterLink>
          </div>

          <div v-if="isLoading" class="panel-placeholder" role="status">Carregando tarefas...</div>
          <div v-else-if="pendingItems.length" class="next-steps-list">
            <RouterLink
              v-for="(item, index) in pendingItems.slice(0, 4)"
              :key="item.id"
              class="next-step-row"
              :to="{ name: 'study-list' }"
              :style="{ '--subject-color': item.subjectColor || 'var(--accent)' }"
            >
              <span class="next-step-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="next-step-copy">
                <strong>{{ item.name }}</strong>
                <small>{{ item.subjectName }}</small>
              </span>
              <span class="next-step-arrow" aria-hidden="true">→</span>
            </RouterLink>
          </div>
          <div v-else class="panel-empty">
            <p>{{ studyItems.length ? 'Sua lista está em dia. Que tal adicionar um novo objetivo?' : 'Adicione tarefas para planejar seus próximos estudos.' }}</p>
            <RouterLink :to="{ name: 'study-list' }">Abrir lista <span aria-hidden="true">→</span></RouterLink>
          </div>
        </section>

        <section class="dashboard-panel essays-panel" aria-labelledby="essays-title">
          <div class="panel-heading">
            <div>
              <p class="page-eyebrow">Prática de escrita</p>
              <h2 id="essays-title">Redações recentes</h2>
            </div>
            <RouterLink class="panel-link" :to="{ name: 'essays' }">Todas <span aria-hidden="true">→</span></RouterLink>
          </div>

          <div v-if="isLoading" class="panel-placeholder" role="status">Carregando redações...</div>
          <div v-else-if="essays.length" class="essay-list">
            <RouterLink
              v-for="essay in essays.slice(0, 3)"
              :key="essay.id"
              class="essay-row"
              :to="{ name: 'essay-detail', params: { id: essay.id } }"
            >
              <span class="essay-row-mark" aria-hidden="true">Aa</span>
              <span class="essay-row-copy">
                <strong>{{ essay.title || essay.theme }}</strong>
                <small>{{ essay.date }}</small>
              </span>
              <span v-if="essay.score !== null" class="essay-row-score">{{ essay.score }}<small>/1000</small></span>
              <span v-else class="essay-row-pending">Pendente</span>
            </RouterLink>
          </div>
          <div v-else class="panel-empty">
            <p>Suas redações e avaliações ficam reunidas neste espaço.</p>
            <RouterLink :to="{ name: 'essays' }">Criar redação <span aria-hidden="true">→</span></RouterLink>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: 20px;
}

.home-hero {
  position: relative;
  display: flex;
  min-height: 270px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: clamp(26px, 4vw, 46px);
  border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
  border-radius: 20px;
  background:
    radial-gradient(ellipse at 82% 45%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 40%),
    linear-gradient(115deg, color-mix(in srgb, var(--accent-soft) 64%, var(--surface)), var(--surface) 72%);
  box-shadow: var(--shadow-card);
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 640px;
}

.hero-copy .page-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
}

.hero-eyebrow-mark {
  color: var(--accent);
  font-size: 15px;
}

.home-title {
  max-width: 620px;
  margin: 12px 0 0;
  color: var(--text);
  font: 500 clamp(34px, 4.3vw, 54px)/1.08 var(--font-title);
  letter-spacing: -.05em;
}

.home-copy {
  max-width: 510px;
  margin: 15px 0 22px;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-secondary-link,
.panel-link,
.panel-empty a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 650;
  text-decoration: none;
}

.hero-secondary-link:hover,
.panel-link:hover,
.panel-empty a:hover {
  color: var(--accent-hover);
}

.hero-art {
  position: relative;
  width: 210px;
  height: 210px;
  flex: 0 0 210px;
  margin: 0 3% 0 20px;
}

.orbit {
  position: absolute;
  inset: 50%;
  display: block;
  border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.orbit-outer {
  width: 198px;
  height: 198px;
}

.orbit-inner {
  width: 145px;
  height: 145px;
  border-style: dashed;
  opacity: .7;
}

.orbit-core {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 78px;
  height: 78px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border));
  border-radius: 24px;
  color: #fff;
  background: linear-gradient(145deg, var(--accent), color-mix(in srgb, var(--accent) 68%, #d0a6bc));
  box-shadow: 0 12px 30px color-mix(in srgb, var(--accent) 25%, transparent);
  transform: translate(-50%, -50%) rotate(-8deg);
}

.orbit-core span {
  font: 700 34px var(--font-title);
  letter-spacing: -.08em;
  transform: rotate(8deg);
}

.orbit-spark {
  position: absolute;
  color: var(--accent);
}

.orbit-spark-one {
  top: 18px;
  right: 33px;
  font-size: 19px;
}

.orbit-spark-two {
  bottom: 24px;
  left: 22px;
  color: color-mix(in srgb, var(--accent) 60%, #c6a86a);
  font-size: 24px;
}

.home-error {
  margin: 0;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.overview-stat {
  display: flex;
  min-width: 0;
  min-height: 91px;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.stat-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
}

.subject-stat-icon {
  color: #776cc3;
  background: #f0eefb;
}

.topic-stat-icon {
  color: #5e8a82;
  background: #eaf3f0;
}

.task-stat-icon {
  color: #b48354;
  background: #f8f0e5;
}

.essay-stat-icon {
  color: #ab7185;
  background: #f7edf1;
}

:global(:root[data-theme='dark']) .subject-stat-icon,
:global(:root[data-theme='dark']) .topic-stat-icon,
:global(:root[data-theme='dark']) .task-stat-icon,
:global(:root[data-theme='dark']) .essay-stat-icon {
  background: color-mix(in srgb, currentColor 14%, var(--surface));
}

.overview-stat > div {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.overview-stat strong {
  color: var(--text);
  font: 600 23px/1 var(--font-title);
  letter-spacing: -.035em;
}

.overview-stat span:not(.stat-icon) {
  overflow: hidden;
  color: var(--muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-stat > a {
  display: grid;
  width: 27px;
  height: 27px;
  flex: 0 0 auto;
  place-items: center;
  margin-left: auto;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--muted);
  font-size: 12px;
  text-decoration: none;
  transition: color .18s ease, border-color .18s ease, transform .18s ease;
}

.overview-stat > a:hover {
  transform: translate(2px, -2px);
  border-color: var(--accent);
  color: var(--accent);
}

.home-shortcuts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

.shortcut-link {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  padding: 15px 16px;
  color: inherit;
  text-decoration: none;
  transition: background .18s ease;
}

.shortcut-link + .shortcut-link {
  border-left: 1px solid var(--border);
}

.shortcut-link:hover {
  background: color-mix(in srgb, var(--accent) 4%, var(--surface));
}

.shortcut-icon {
  display: grid;
  width: 33px;
  height: 33px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
  border-radius: 10px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  font: 600 9px var(--font-title);
}

.shortcut-link > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.shortcut-link strong {
  overflow: hidden;
  color: var(--text);
  font: 600 10px var(--font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shortcut-link small {
  overflow: hidden;
  color: var(--muted);
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shortcut-arrow {
  margin-left: auto;
  color: var(--muted);
  font-size: 12px;
}

.home-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, .88fr);
  align-items: start;
  gap: 15px;
}

.dashboard-column {
  display: grid;
  min-width: 0;
  gap: 15px;
}

.dashboard-panel {
  min-width: 0;
  padding: 21px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.panel-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 17px;
}

.panel-heading .page-eyebrow {
  margin: 0 0 5px;
}

.panel-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 18px/1.3 var(--font-title);
  letter-spacing: -.025em;
}

.panel-link {
  flex: 0 0 auto;
  font-size: 9px;
}

.subject-progress-list,
.session-list,
.next-steps-list,
.essay-list {
  display: grid;
}

.subject-progress-row {
  display: grid;
  grid-template-columns: 8px minmax(100px, 1fr) minmax(48px, .75fr) 34px;
  align-items: center;
  gap: 11px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
}

.subject-progress-row:first-child,
.session-row:first-child,
.next-step-row:first-child,
.essay-row:first-child {
  padding-top: 2px;
}

.subject-progress-row:last-child,
.session-row:last-child,
.next-step-row:last-child,
.essay-row:last-child {
  padding-bottom: 2px;
  border-bottom: 0;
}

.subject-color-mark {
  width: 7px;
  height: 29px;
  border-radius: 6px;
  background: var(--subject-color);
}

.subject-progress-copy,
.session-copy,
.next-step-copy,
.essay-row-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.subject-progress-copy strong,
.session-copy strong,
.next-step-copy strong,
.essay-row-copy strong {
  overflow: hidden;
  color: var(--text);
  font: 550 10px/1.4 var(--font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject-progress-copy span,
.session-copy span,
.next-step-copy small,
.essay-row-copy small {
  overflow: hidden;
  color: var(--muted);
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject-progress-track {
  height: 5px;
  overflow: hidden;
  border-radius: 10px;
  background: var(--surface-raised);
}

.subject-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--subject-color);
}

.subject-progress-value {
  color: var(--text-soft);
  font: 600 9px var(--font-title);
  text-align: right;
}

.weekly-time {
  display: grid;
  gap: 3px;
  text-align: right;
}

.weekly-time strong {
  color: var(--accent);
  font: 600 17px var(--font-title);
}

.weekly-time span {
  color: var(--muted);
  font-size: 8px;
}

.session-row {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.session-mark {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--subject-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--subject-color) 12%, transparent);
}

.session-row time {
  color: var(--muted);
  font-size: 8px;
  white-space: nowrap;
}

.session-duration {
  min-width: 50px;
  color: var(--text-soft);
  font-size: 8px;
  text-align: right;
}

.next-step-row {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
}

.next-step-index {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 18%, var(--border));
  border-radius: 9px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 8%, var(--surface));
  font: 600 9px var(--font-title);
}

.next-step-arrow {
  color: var(--muted);
  font-size: 12px;
  transition: color .18s ease, transform .18s ease;
}

.next-step-row:hover .next-step-arrow {
  transform: translateX(3px);
  color: var(--subject-color);
}

.essay-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
}

.essay-row-mark {
  display: grid;
  width: 33px;
  height: 33px;
  place-items: center;
  border-radius: 10px;
  color: #a56d83;
  background: color-mix(in srgb, #a56d83 10%, var(--surface));
  font: 600 12px var(--font-title);
}

.essay-row-score {
  color: var(--accent);
  font: 600 12px var(--font-title);
  white-space: nowrap;
}

.essay-row-score small {
  margin-left: 2px;
  color: var(--muted);
  font: 400 8px var(--font-body);
}

.essay-row-pending {
  padding: 5px 8px;
  border-radius: 20px;
  color: var(--muted);
  background: var(--surface-raised);
  font-size: 8px;
  white-space: nowrap;
}

.panel-placeholder,
.panel-empty {
  display: grid;
  min-height: 80px;
  align-content: center;
  gap: 9px;
  color: var(--muted);
  font-size: 9px;
}

.panel-empty p {
  margin: 0 0 9px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .overview-stats,
  .home-shortcuts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shortcut-link:nth-child(3) {
    border-left: 0;
  }

  .shortcut-link:nth-child(n + 3) {
    border-top: 1px solid var(--border);
  }

  .hero-art {
    margin-right: 0;
  }
}

@media (max-width: 760px) {
  .home-dashboard {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-art {
    width: 150px;
    height: 150px;
    flex-basis: 150px;
  }

  .orbit-outer {
    width: 145px;
    height: 145px;
  }

  .orbit-inner {
    width: 105px;
    height: 105px;
  }

  .orbit-core {
    width: 60px;
    height: 60px;
    border-radius: 19px;
  }

  .orbit-core span {
    font-size: 27px;
  }
}

@media (max-width: 560px) {
  .home-page {
    gap: 14px;
  }

  .home-hero {
    min-height: 0;
    padding: 25px 22px;
  }

  .hero-art {
    position: absolute;
    right: -49px;
    bottom: -48px;
    width: 155px;
    height: 155px;
    margin: 0;
    opacity: .4;
  }

  .home-title {
    max-width: 330px;
    font-size: clamp(34px, 10vw, 44px);
  }

  .home-copy {
    max-width: 370px;
    font-size: 11px;
  }

  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .overview-stats {
    gap: 8px;
  }

  .overview-stat {
    min-height: 78px;
    gap: 9px;
    padding: 11px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .stat-icon svg {
    width: 16px;
    height: 16px;
  }

  .overview-stat strong {
    font-size: 20px;
  }

  .overview-stat span:not(.stat-icon) {
    font-size: 8px;
  }

  .overview-stat > a {
    display: none;
  }

  .shortcut-link {
    gap: 8px;
    padding: 12px 10px;
  }

  .shortcut-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    font-size: 8px;
  }

  .shortcut-link strong {
    font-size: 9px;
  }

  .shortcut-link small {
    font-size: 7px;
  }

  .shortcut-arrow {
    display: none;
  }

  .dashboard-panel {
    padding: 17px 15px;
  }

  .panel-heading h2 {
    font-size: 16px;
  }

  .subject-progress-row {
    grid-template-columns: 7px minmax(85px, 1fr) minmax(35px, .6fr) 30px;
    gap: 8px;
  }

  .session-row {
    grid-template-columns: 9px minmax(0, 1fr) auto;
    gap: 8px;
  }

  .session-duration {
    display: none;
  }
}
</style>
