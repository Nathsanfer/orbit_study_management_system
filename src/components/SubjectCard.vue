<script setup>
import { getSubjectIcon } from '@/lib/icons.js';

defineProps({
  subject: {
    type: Object,
    required: true,
  },
});

defineEmits(['edit', 'delete']);
</script>

<template>
  <article
    class="subject-card"
    :style="{ '--subject-color': subject.color }"
  >
    <RouterLink
      class="subject-card-link"
      :to="{ name: 'subject-detail', params: { id: subject.id } }"
    >
      <div class="card-topline">
        <span class="subject-icon" aria-hidden="true">
          <component :is="getSubjectIcon(subject.icon)" :size="21" :stroke-width="1.7" />
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
    <div class="subject-card-actions">
      <button
        class="edit-subject-button"
        type="button"
        :aria-label="`Editar matéria ${subject.name}`"
        :title="`Editar matéria ${subject.name}`"
        @click="$emit('edit', subject)"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m10.8 2.8 2.4 2.4M3 13l2.8-.6 7.7-7.7a1.7 1.7 0 0 0-2.4-2.4l-7.7 7.7L3 13Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="delete-subject-button"
        type="button"
        :aria-label="`Excluir matéria ${subject.name}`"
        :title="`Excluir matéria ${subject.name}`"
        @click="$emit('delete', subject)"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2.5 4.5h11m-9.5 0 .6 8.3c.1.5.5.8 1 .8h5c.5 0 .9-.3 1-.8l.6-8.3M6 4.5V3.4c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9v1.1M6.5 7v4m3-4v4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.subject-card {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 232px;
  flex-direction: column;
  overflow: hidden;
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

.subject-card-link {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: inherit;
  flex: 1;
  flex-direction: column;
  padding: 20px;
  color: inherit;
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

.subject-card-link:focus-visible,
.edit-subject-button:focus-visible,
.delete-subject-button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--subject-color) 45%, transparent);
  outline-offset: 3px;
}

.card-topline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-card-actions {
  position: absolute;
  z-index: 2;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 7px;
}

.edit-subject-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 18%, var(--border));
  border-radius: 50%;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 7%, var(--surface));
  cursor: pointer;
  transition: transform .18s ease, background .18s ease;
}

.edit-subject-button:hover,
.delete-subject-button:hover {
  transform: translateY(-1px);
}

.edit-subject-button:hover {
  background: color-mix(in srgb, var(--subject-color) 15%, var(--surface));
}

.delete-subject-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid color-mix(in srgb, #b54747 20%, var(--border));
  border-radius: 50%;
  color: #b54747;
  background: color-mix(in srgb, #b54747 7%, var(--surface));
  cursor: pointer;
  transition: transform .18s ease, background .18s ease;
}

.delete-subject-button:hover {
  background: color-mix(in srgb, #b54747 15%, var(--surface));
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
:global(:root[data-theme='dark']) .card-open {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

@media (max-width: 720px) {
  .subject-card {
    min-height: 220px;
  }

  .subject-card-link {
    padding: 17px;
  }

  .subject-card-actions {
    top: 17px;
    right: 17px;
  }
}
</style>
