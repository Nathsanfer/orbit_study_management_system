<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { subjects } from '@/data/subjects.js';

const totalTopics = computed(() =>
  subjects.value.reduce((total, subject) => total + subject.topics.length, 0),
);
const overallProgress = computed(() => {
  if (!subjects.value.length) return 0;
  return Math.round(subjects.value.reduce((total, subject) => total + subject.progress, 0) / subjects.value.length);
});
</script>

<template>
  <section class="home-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span aria-current="page">Seu espaço</span>
    </nav>
    <div class="home-welcome">
      <p class="page-eyebrow">Seu espaço de aprendizado</p>
      <h1 class="home-title">Um caminho de cada vez.</h1>
      <p class="home-copy">
        Seus estudos não precisam acontecer todos de uma vez. Encontre suas matérias,
        retome de onde parou e celebre cada pequena conquista.
      </p>
      <RouterLink class="primary-button" :to="{ name: 'subjects' }">
        Explorar minhas matérias <span aria-hidden="true">→</span>
      </RouterLink>
      <div class="home-stats">
        <div class="home-stat">
          <strong>{{ subjects.length }}</strong>
          <span>matérias organizadas</span>
        </div>
        <div class="home-stat">
          <strong>{{ totalTopics }}</strong>
          <span>tópicos para explorar</span>
        </div>
        <div class="home-stat">
          <strong>{{ overallProgress }}%</strong>
          <span>progresso médio</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.home-welcome {
  padding: clamp(24px, 4vw, 42px);
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.home-title {
  max-width: 580px;
  margin: 12px 0 0;
  color: var(--text);
  font: 500 clamp(32px, 3.2vw, 43px)/1.13 var(--font-title);
  letter-spacing: -.035em;
}

.home-copy {
  max-width: 520px;
  margin: 14px 0 22px;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.7;
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
  margin-top: 22px;
}

.home-stat {
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-soft);
}

.home-stat strong {
  display: block;
  color: var(--accent);
  font: 500 25px var(--font-title);
}

.home-stat span {
  color: var(--text-soft);
  font-size: 10px;
}

@media (max-width: 480px) {
  .home-stats {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
