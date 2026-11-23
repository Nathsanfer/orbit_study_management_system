<script setup>
import { getSubjectIcon } from '@/lib/icons.js';

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
      <span class="subject-icon" aria-hidden="true">
        <component :is="getSubjectIcon(subject.icon)" :size="21" :stroke-width="1.7" />
      </span>
      <span class="open-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M5 15 15 5M6 5h9v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>

    <h2 class="subject-name">{{ subject.name }}</h2>
    <p class="subject-description">
      {{ subject.description || 'Nenhuma descrição informada.' }}
    </p>

    <div class="card-footer">
      <span class="topic-count">
        {{ subject.topics.length }} {{ subject.topics.length === 1 ? 'tópico' : 'tópicos' }}
      </span>
      <span class="card-open">Ver matéria <span aria-hidden="true">→</span></span>
    </div>
  </RouterLink>
</template>

<style scoped>
.subject-card {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 232px;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--subject-color) 7%, var(--surface)),
    var(--surface) 58%
  );
  box-shadow: var(--shadow-card);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.subject-card > * {
  position: relative;
  z-index: 1;
}

.subject-card::before {
  position: absolute;
  z-index: 1;
  top: 20px;
  bottom: 20px;
  left: 0;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: var(--subject-color);
  content: '';
}

.subject-card::after {
  position: absolute;
  z-index: 0;
  top: -55px;
  right: -45px;
  width: 150px;
  height: 150px;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--subject-color) 4%, transparent);
  content: '';
  pointer-events: none;
}

.subject-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--subject-color) 45%, var(--border));
  box-shadow: var(--shadow-hover);
}

.subject-card:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--subject-color) 45%, transparent);
  outline-offset: 3px;
}

.card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.subject-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, transparent);
  border-radius: 14px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 11%, var(--surface));
}

.open-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 18%, var(--border));
  border-radius: 50%;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 7%, var(--surface));
  transition: transform .2s ease, background .2s ease;
}

.open-icon svg {
  width: 16px;
  height: 16px;
}

.subject-card:hover .open-icon {
  transform: translate(2px, -2px);
  background: color-mix(in srgb, var(--subject-color) 14%, var(--surface));
}

.subject-name {
  margin: 19px 0 8px;
  color: var(--text);
  font: 500 22px/1.2 var(--font-title);
  letter-spacing: -.02em;
}

.subject-description {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 17px;
  border-top: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
}

.topic-count {
  color: var(--text-soft);
  font-size: 10px;
}

.card-open {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--subject-color);
  font-size: 10px;
  font-weight: 600;
  transition: gap .18s ease;
}

.subject-card:hover .card-open {
  gap: 8px;
}

:global(:root[data-theme='dark']) .subject-icon,
:global(:root[data-theme='dark']) .open-icon,
:global(:root[data-theme='dark']) .card-open {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

@media (max-width: 720px) {
  .subject-card {
    min-height: 220px;
    padding: 17px;
  }
}
</style>
