<script setup>
defineProps({
  subject: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <RouterLink
    class="subject-card"
    :to="{ name: 'subject-detail', params: { id: subject.id } }"
    :style="{ '--subject-color': subject.color }"
  >
    <div class="card-topline">
      <span class="subject-icon" aria-hidden="true">{{ subject.icon }}</span>
      <span v-if="subject.progress === 100" class="completion-badge">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Concluída
      </span>
    </div>

    <h2 class="subject-name">{{ subject.name }}</h2>
    <p class="topic-count">{{ subject.topics.length }} tópicos para explorar</p>

    <div class="progress-area">
      <div
        class="progress-track"
        role="progressbar"
        :aria-label="`Progresso em ${subject.name}`"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="subject.progress"
      >
        <div class="progress-fill" :style="{ width: `${subject.progress}%` }"></div>
      </div>
      <span class="progress-label">{{ subject.progress }}%</span>
    </div>

    <div class="card-footer">
      <span>{{ subject.progress === 100 ? 'Jornada completa' : 'Progresso de estudo' }}</span>
      <span class="card-open">Ver tópicos <span aria-hidden="true">→</span></span>
    </div>
  </RouterLink>
</template>

<style scoped>
.subject-card {
  position: relative;
  display: flex;
  min-height: 206px;
  flex-direction: column;
  overflow: hidden;
  padding: 19px 19px 17px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
}

.subject-card::after {
  position: absolute;
  right: -23px;
  bottom: -34px;
  width: 104px;
  height: 104px;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, transparent);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.subject-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--subject-color) 45%, var(--border));
  box-shadow: var(--shadow-hover);
}

.card-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.subject-icon {
  display: grid;
  width: 43px;
  height: 43px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, transparent);
  border-radius: 12px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 11%, var(--surface));
  font: 600 18px/1 var(--font-title);
}

.completion-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 20px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 10%, var(--surface));
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
}

.completion-badge svg {
  width: 11px;
  height: 11px;
}

.subject-name {
  margin: 18px 0 5px;
  color: var(--text);
  font: 500 21px/1.2 var(--font-title);
  letter-spacing: -.02em;
}

.topic-count {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
}

.progress-area {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: auto;
  padding-top: 21px;
}

.progress-track {
  height: 5px;
  flex: 1;
  overflow: hidden;
  border-radius: 6px;
  background: var(--track);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--subject-color);
  transition: width .3s ease;
}

.progress-label {
  min-width: 31px;
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
  text-align: right;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  color: var(--muted);
  font-size: 9px;
}

.card-open {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--subject-color);
  font-weight: 600;
  transition: gap .18s ease;
}

.subject-card:hover .card-open {
  gap: 8px;
}

:global(:root[data-theme='dark']) .subject-icon,
:global(:root[data-theme='dark']) .completion-badge,
:global(:root[data-theme='dark']) .card-open {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

:global(:root[data-theme='dark']) .progress-fill {
  background: color-mix(in srgb, var(--subject-color) 60%, white);
}

@media (max-width: 720px) {
  .subject-card {
    min-height: 196px;
    padding: 15px;
  }
}
</style>
