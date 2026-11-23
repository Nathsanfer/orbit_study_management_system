<script setup>
import { computed, ref } from 'vue';
import SubjectCard from '@/components/SubjectCard.vue';
import { subjects, subjectColors } from '@/data/subjects.js';

const searchQuery = ref('');
const showAddDialog = ref(false);
const newSubjectName = ref('');
const newSubjectColor = ref(subjectColors[0]);

const filteredSubjects = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('pt-BR');
  if (!query) return subjects.value;

  return subjects.value.filter((subject) =>
    subject.name.toLocaleLowerCase('pt-BR').includes(query),
  );
});

function createSubject() {
  const name = newSubjectName.value.trim();
  if (!name) return;

  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const id = `${slug || 'materia'}-${Date.now()}`;

  subjects.value.push({
    id,
    name,
    icon: '✦',
    color: newSubjectColor.value,
    topics: [],
    progress: 0,
  });

  searchQuery.value = '';
  newSubjectName.value = '';
  showAddDialog.value = false;
}

function closeDialog() {
  showAddDialog.value = false;
}
</script>

<template>
  <section class="subjects-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Matérias</span>
    </nav>

    <header class="subjects-header">
      <div class="header-left">
        <p class="page-eyebrow">Um passo de cada vez</p>
        <h1 class="title">Minhas matérias</h1>
        <p class="subtitle">Um espaço tranquilo para cada parte da sua jornada de estudos.</p>
      </div>
      <div class="header-right">
        <label class="search-wrap">
          <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.6" />
            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            class="search"
            type="search"
            placeholder="Buscar matéria..."
            aria-label="Buscar matéria"
          />
        </label>
        <button class="add-btn" type="button" @click="showAddDialog = true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          Nova matéria
        </button>
      </div>
    </header>

    <div class="cards-grid">
      <SubjectCard v-for="subject in filteredSubjects" :key="subject.id" :subject="subject" />
      <div v-if="filteredSubjects.length === 0" class="empty-state">
        <h2>Nenhuma matéria por aqui</h2>
        <p>Tente outro nome ou crie uma nova matéria para começar.</p>
      </div>
    </div>

    <div v-if="showAddDialog" class="modal-backdrop" @click.self="closeDialog" @keydown.esc="closeDialog">
      <section
        class="subject-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-subject-title"
      >
        <div class="dialog-heading">
          <div>
            <h2 id="new-subject-title" class="dialog-title">Nova matéria</h2>
            <p class="dialog-copy">Crie um cantinho para organizar seus próximos estudos.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" @click="closeDialog">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createSubject">
          <label class="field-label" for="subject-name">Nome da matéria</label>
          <input
            id="subject-name"
            v-model="newSubjectName"
            class="dialog-input"
            type="text"
            maxlength="60"
            placeholder="Ex.: Filosofia"
            required
            autofocus
          />

          <span class="field-label color-label">Escolha uma cor</span>
          <div class="color-options" role="group" aria-label="Cor da matéria">
            <button
              v-for="color in subjectColors"
              :key="color"
              class="color-option"
              :class="{ selected: newSubjectColor === color }"
              :style="{ '--option-color': color }"
              type="button"
              :aria-label="`Selecionar cor ${color}`"
              :aria-pressed="newSubjectColor === color"
              @click="newSubjectColor = color"
            ></button>
          </div>

          <div class="dialog-actions">
            <button class="secondary-button" type="button" @click="closeDialog">Cancelar</button>
            <button class="primary-button" type="submit">Criar matéria</button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.subjects-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}

.header-left {
  min-width: 220px;
}

.title {
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(32px, 3.2vw, 43px)/1.13 var(--font-title);
  letter-spacing: -.035em;
}

.subtitle {
  margin: 10px 0 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.65;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrap {
  position: relative;
  display: flex;
  width: min(255px, 27vw);
  height: 42px;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 13px;
  color: var(--muted);
  pointer-events: none;
}

.search {
  width: 100%;
  height: 100%;
  padding: 0 13px 0 39px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: var(--surface);
  font-size: 11px;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.search::placeholder {
  color: var(--muted);
}

.search:focus {
  border-color: var(--c-lavender);
  outline: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-lavender) 18%, transparent);
}

.add-btn {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
  background: var(--accent-hover);
  box-shadow: 0 5px 14px color-mix(in srgb, var(--accent) 20%, transparent);
}

:global(:root[data-theme='dark']) .add-btn {
  color: #241a20;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.modal-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(31 20 34 / 42%);
  backdrop-filter: blur(4px);
}

.subject-dialog {
  width: min(100%, 420px);
  padding: 26px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: 0 24px 70px rgb(21 12 23 / 25%);
}

.dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 23px;
}

.dialog-title {
  margin: 0;
  color: var(--text);
  font: 500 26px var(--font-title);
}

.dialog-copy {
  margin: 6px 0 0;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.55;
}

.icon-button {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--surface);
  cursor: pointer;
}

.field-label {
  display: block;
  margin-bottom: 7px;
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.dialog-input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font-size: 12px;
}

.color-label {
  margin-top: 20px;
}

.color-options {
  display: flex;
  gap: 9px;
  margin: 11px 0 25px;
}

.color-option {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 2px solid transparent;
  border-radius: 50%;
  background: var(--option-color);
  cursor: pointer;
}

.color-option.selected {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--surface);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

@media (max-width: 1050px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .subjects-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-right {
    width: 100%;
  }

  .search-wrap {
    width: min(100%, 340px);
  }
}

@media (max-width: 720px) {
  .subjects-header {
    gap: 19px;
    margin-bottom: 25px;
  }

  .header-right {
    align-items: stretch;
  }

  .search-wrap {
    flex: 1;
  }

  .add-btn {
    padding-inline: 12px;
  }

  .cards-grid {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .subjects-header {
    margin-bottom: 21px;
  }

  .title {
    font-size: 34px;
  }

  .header-right {
    flex-direction: column;
  }

  .search-wrap {
    width: 100%;
    min-height: 42px;
  }

  .add-btn {
    width: 100%;
  }
}
</style>
