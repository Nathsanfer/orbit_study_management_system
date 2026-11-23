<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { essays } from '@/data/essays.js';

const route = useRoute();
const essay = computed(() => essays.find((item) => item.id === route.params.id));
</script>

<template>
  <section v-if="essay" class="essay-detail-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <RouterLink :to="{ name: 'essays' }">Redações</RouterLink>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Detalhes</span>
    </nav>

    <header class="detail-header">
      <div>
        <p class="page-eyebrow">Redação de {{ essay.date }}</p>
        <h1 class="page-title">{{ essay.theme }}</h1>
      </div>
      <div class="score-card" aria-label="Nota final">
        <span>Nota final</span>
        <strong>{{ essay.score }}<small>/1000</small></strong>
      </div>
    </header>

    <div class="detail-layout">
      <article class="essay-paper">
        <div class="paper-heading">
          <span class="paper-mark" aria-hidden="true">Aa</span>
          <div>
            <span class="page-eyebrow">Texto dissertativo-argumentativo</span>
            <h2>Sua redação</h2>
          </div>
        </div>
        <div class="essay-text">
          <p v-for="(paragraph, index) in essay.essay" :key="index">{{ paragraph }}</p>
        </div>
        <p class="sample-note">Texto demonstrativo para visualização da tela de avaliação.</p>
      </article>

      <section class="evaluation-panel" aria-labelledby="evaluation-title">
        <div class="evaluation-heading">
          <div>
            <p class="page-eyebrow">Avaliação por competência</p>
            <h2 id="evaluation-title">Detalhamento da nota</h2>
          </div>
          <span class="competency-total">{{ essay.competencies.length }} critérios</span>
        </div>

        <article
          v-for="(competency, index) in essay.competencies"
          :key="competency.name"
          class="competency-card"
        >
          <div class="competency-topline">
            <span class="competency-number">0{{ index + 1 }}</span>
            <h3>{{ competency.name }}</h3>
            <strong>{{ competency.score }}<small>/200</small></strong>
          </div>
          <p>{{ competency.feedback }}</p>
        </article>

        <div class="evaluation-total">
          <span>Nota total</span>
          <strong>{{ essay.score }} <small>/ 1000</small></strong>
        </div>
      </section>
    </div>

    <RouterLink class="back-link" :to="{ name: 'essays' }">← Voltar para redações</RouterLink>
  </section>

  <section v-else class="empty-state">
    <h1>Redação não encontrada</h1>
    <p>Essa redação pode ter sido removida ou o endereço está incorreto.</p>
    <RouterLink class="primary-button" :to="{ name: 'essays' }">Voltar para redações</RouterLink>
  </section>
</template>

<style scoped>
.detail-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 23px;
}

.page-title {
  max-width: 760px;
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(29px, 3vw, 38px)/1.18 var(--font-title);
  letter-spacing: -.035em;
}

.score-card {
  display: grid;
  flex: 0 0 auto;
  gap: 4px;
  padding: 12px 17px;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--border));
  border-radius: 11px;
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  text-align: center;
}

.score-card span {
  color: var(--muted);
  font-size: 9px;
}

.score-card strong {
  color: var(--accent);
  font: 500 23px var(--font-title);
}

.score-card small {
  margin-left: 2px;
  color: var(--muted);
  font: 400 9px var(--font-body);
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr);
  align-items: start;
  gap: 17px;
}

.essay-paper,
.evaluation-panel {
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.essay-paper {
  padding: 22px 24px;
}

.paper-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.paper-mark {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 15px var(--font-title);
}

.paper-heading .page-eyebrow {
  margin: 0;
  font-size: 8px;
}

.paper-heading h2,
.evaluation-heading h2 {
  margin: 4px 0 0;
  color: var(--text);
  font: 500 21px var(--font-title);
}

.essay-text {
  padding-top: 7px;
}

.essay-text p {
  margin: 15px 0;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.85;
  text-align: justify;
}

.sample-note {
  margin: 17px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 9px;
}

.evaluation-panel {
  padding: 20px;
}

.evaluation-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.evaluation-heading .page-eyebrow {
  margin: 0;
  font-size: 8px;
}

.evaluation-heading h2 {
  font-size: 19px;
}

.competency-total {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 20px;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 8px;
}

.competency-card {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.competency-topline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.competency-number {
  display: grid;
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 8px;
  font-weight: 700;
}

.competency-topline h3 {
  flex: 1;
  margin: 0;
  color: var(--text);
  font-size: 10px;
  font-weight: 600;
}

.competency-topline strong {
  flex: 0 0 auto;
  color: var(--accent);
  font: 500 15px var(--font-title);
}

.competency-topline small {
  margin-left: 1px;
  color: var(--muted);
  font: 400 8px var(--font-body);
}

.competency-card p {
  margin: 8px 0 0 33px;
  color: var(--text-soft);
  font-size: 9px;
  line-height: 1.55;
}

.evaluation-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 14px;
}

.evaluation-total span {
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.evaluation-total strong {
  color: var(--accent);
  font: 500 21px var(--font-title);
}

.evaluation-total small {
  color: var(--muted);
  font: 400 9px var(--font-body);
}

.back-link {
  display: inline-flex;
  margin-top: 18px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 600;
}

.back-link:hover {
  color: var(--accent-hover);
}

@media (max-width: 850px) {
  .detail-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 520px) {
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .score-card {
    width: 100%;
    grid-template-columns: 1fr auto;
    align-items: center;
    text-align: left;
  }

  .essay-paper,
  .evaluation-panel {
    padding: 17px;
  }
}
</style>
