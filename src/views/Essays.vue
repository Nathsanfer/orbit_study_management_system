<script setup>
import { essays } from '@/data/essays.js';
</script>

<template>
  <section class="essays-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Redações</span>
    </nav>

    <header class="essays-header">
      <p class="page-eyebrow">Escrever também é aprender</p>
      <h1 class="page-title">Minhas redações</h1>
      <p class="page-subtitle">Relembre seus temas, acompanhe as notas e veja os detalhes de cada avaliação.</p>
    </header>

    <div class="essay-grid">
      <RouterLink
        v-for="essay in essays"
        :key="essay.id"
        class="essay-card"
        :to="{ name: 'essay-detail', params: { id: essay.id } }"
        :aria-label="`${essay.theme}, nota ${essay.score} de 1000. Ver redação e avaliação`"
      >
        <div class="card-topline">
          <span class="essay-mark" aria-hidden="true">Aa</span>
          <span class="essay-date">{{ essay.date }}</span>
        </div>
        <h2>{{ essay.theme }}</h2>
        <p class="essay-excerpt">{{ essay.excerpt }}</p>
        <div class="card-footer">
          <span class="score-label">Nota</span>
          <strong class="essay-score">{{ essay.score }}<small>/1000</small></strong>
          <span class="card-action">Ver redação <span aria-hidden="true">→</span></span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.essays-header {
  margin-bottom: 28px;
}

.page-title {
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(31px, 3.2vw, 42px)/1.15 var(--font-title);
  letter-spacing: -.035em;
}

.page-subtitle {
  max-width: 540px;
  margin: 9px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.essay-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.essay-card {
  display: flex;
  min-height: 250px;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.essay-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 32%, var(--border));
  box-shadow: var(--shadow-hover);
}

.card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.essay-mark {
  display: grid;
  width: 37px;
  height: 37px;
  place-items: center;
  border-radius: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 15px var(--font-title);
}

.essay-date {
  color: var(--muted);
  font-size: 9px;
}

.essay-card h2 {
  margin: 18px 0 8px;
  color: var(--text);
  font: 500 19px/1.35 var(--font-title);
}

.essay-excerpt {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 18px;
  color: var(--text-soft);
  font-size: 10px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-footer {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-top: auto;
  padding-top: 13px;
  border-top: 1px solid var(--border);
}

.score-label {
  color: var(--muted);
  font-size: 9px;
}

.essay-score {
  color: var(--accent);
  font: 500 20px var(--font-title);
}

.essay-score small {
  margin-left: 2px;
  color: var(--muted);
  font: 400 9px var(--font-body);
}

.card-action {
  margin-left: auto;
  color: var(--text-soft);
  font-size: 9px;
}

.essay-card:hover .card-action {
  color: var(--accent);
}

@media (max-width: 1000px) {
  .essay-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .essay-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
