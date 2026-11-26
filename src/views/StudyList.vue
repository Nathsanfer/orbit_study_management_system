<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { loadSubjects, subjects } from '@/data/subjects.js';
import { getErrorMessage, getSupabase } from '@/lib/supabase.js';

const items = ref([]);
const newItem = ref('');
const selectedSubjectId = ref('');
const isLoading = ref(true);
const errorMessage = ref('');

onMounted(loadData);

async function loadData() {
  errorMessage.value = '';
  try {
    const client = getSupabase();
    const [availableSubjects, result] = await Promise.all([
      loadSubjects(),
      client
        .from('itens_lista')
        .select('id,id_materia,titulo,status,posicao,materias(nome)')
        .order('posicao'),
    ]);
    if (result.error) throw result.error;
    items.value = (result.data ?? []).map((item) => ({
      id: item.id,
      subjectId: item.id_materia,
      subjectName: item.materias.nome,
      subjectColor: availableSubjects.find((subject) => subject.id === item.id_materia)?.color,
      name: item.titulo,
      done: item.status === 'concluido',
      position: item.posicao,
    }));
    if (!selectedSubjectId.value && availableSubjects.length) {
      selectedSubjectId.value = availableSubjects[0].id;
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

async function addItem() {
  const name = newItem.value.trim();
  if (!name || !selectedSubjectId.value) return;

  errorMessage.value = '';
  try {
    const client = getSupabase();
    const position = items.value.reduce((max, item) => Math.max(max, item.position), -1) + 1;
    const { data, error } = await client
      .from('itens_lista')
      .insert({
        id_materia: selectedSubjectId.value,
        titulo: name,
        status: 'pendente',
        posicao: position,
      })
      .select('id,id_materia,titulo,status,posicao,materias(nome)')
      .single();
    if (error) throw error;

    items.value.push({
      id: data.id,
      subjectId: data.id_materia,
      subjectName: data.materias.nome,
      subjectColor: subjects.value.find((subject) => subject.id === data.id_materia)?.color,
      name: data.titulo,
      done: data.status === 'concluido',
      position: data.posicao,
    });
    newItem.value = '';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
}

async function updateStatus(item) {
  const updatedDone = item.done;
  item.isUpdating = true;
  errorMessage.value = '';
  try {
    const { error } = await getSupabase()
      .from('itens_lista')
      .update({ status: updatedDone ? 'concluido' : 'pendente' })
      .eq('id', item.id)
      .select('id')
      .single();
    if (error) throw error;
  } catch (error) {
    item.done = !updatedDone;
    errorMessage.value = getErrorMessage(error);
  } finally {
    item.isUpdating = false;
  }
}
</script>

<template>
  <section class="study-list-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Lista de estudos</span>
    </nav>

    <header class="list-header">
      <p class="page-eyebrow">Pequenos passos, grandes avanços</p>
      <h1 class="page-title">Minha lista de estudos</h1>
      <p class="page-subtitle">Anote o que você quer estudar e marque cada conquista pelo caminho.</p>
    </header>

    <section class="list-panel" aria-label="Itens para estudar">
      <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>

      <form class="add-form" @submit.prevent="addItem">
        <label class="sr-only" for="study-item">Adicionar matéria ou tópico</label>
        <input
          id="study-item"
          v-model="newItem"
          type="text"
          maxlength="100"
          placeholder="Ex.: Revisar funções matemáticas"
          required
        />
        <label class="sr-only" for="study-subject">Matéria do item</label>
        <select id="study-subject" v-model="selectedSubjectId" required :disabled="!subjects.length">
          <option value="" disabled>Selecione uma matéria</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
        </select>
        <button class="primary-button" type="submit" :disabled="!subjects.length">
          <span aria-hidden="true">+</span> Adicionar item
        </button>
      </form>

      <div v-if="!subjects.length && !isLoading && !errorMessage" class="list-hint">
        Cadastre uma matéria antes de adicionar itens à lista.
        <RouterLink :to="{ name: 'subjects' }">Criar matéria</RouterLink>
      </div>

      <div v-if="isLoading" class="empty-state" role="status">Carregando sua lista...</div>
      <ul v-else-if="items.length" class="study-items">
        <li
          v-for="(item, index) in items"
          :key="item.id"
          class="study-item"
          :class="{ completed: item.done }"
          :style="{ '--subject-color': item.subjectColor || 'var(--accent)' }"
        >
          <span class="topic-index" aria-hidden="true">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </span>
          <label class="item-label">
            <input v-model="item.done" type="checkbox" :disabled="item.isUpdating" @change="updateStatus(item)" />
            <span class="custom-checkbox" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="item-name">{{ item.name }}</span>
          </label>
          <div class="item-meta">
            <span class="item-subject">{{ item.subjectName }}</span>
          </div>
        </li>
      </ul>

      <div v-else-if="!errorMessage" class="empty-state">
        <h2>Sua lista está vazia</h2>
        <p>Adicione uma matéria ou tópico para organizar seus próximos estudos.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.list-header {
  margin-bottom: 27px;
}

.page-title {
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(31px, 3.2vw, 42px)/1.15 var(--font-title);
  letter-spacing: -.035em;
}

.page-subtitle {
  margin: 9px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.list-panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.add-form {
  display: flex;
  gap: 9px;
  padding: 19px 22px;
  border-bottom: 1px solid var(--border);
}

.add-form input {
  min-width: 0;
  min-height: 42px;
  flex: 1;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: var(--bg);
  font-size: 11px;
}

.add-form select {
  min-width: 150px;
  min-height: 42px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: var(--bg);
  font-size: 10px;
}

.add-form select:disabled {
  cursor: not-allowed;
  opacity: .65;
}

.list-hint {
  padding: 14px 22px;
  border-bottom: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 10px;
}

.list-hint a {
  margin-left: 5px;
  color: var(--accent);
  font-weight: 600;
}

.add-form input::placeholder {
  color: var(--muted);
}

.study-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 18px 22px 22px;
  list-style: none;
}

.study-item {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 88px;
  grid-template-columns: 38px minmax(0, 1fr) minmax(80px, 30%);
  align-items: center;
  gap: 13px;
  overflow: hidden;
  padding: 14px 15px 14px 17px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--subject-color) 7%, var(--surface)),
    var(--surface) 62%
  );
  box-shadow: 0 3px 12px rgb(34 28 45 / 4%);
  transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease, background .2s ease;
}

.study-item::before {
  position: absolute;
  top: 13px;
  bottom: 13px;
  left: 0;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: color-mix(in srgb, var(--subject-color) 70%, transparent);
  content: '';
}

.study-item:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--subject-color) 38%, var(--border));
  box-shadow: 0 10px 24px color-mix(in srgb, var(--subject-color) 10%, transparent);
}

.topic-index {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 16%, var(--border));
  border-radius: 12px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 9%, var(--surface));
  font: 650 13px var(--font-title);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 28%);
}

:global(:root[data-theme='dark']) .topic-index {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

.item-label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.item-label input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.custom-checkbox {
  display: grid;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  place-items: center;
  border: 1.5px solid color-mix(in srgb, var(--subject-color) 32%, var(--border));
  border-radius: 7px;
  color: transparent;
  background: var(--surface);
  transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease;
}

.item-label input:checked + .custom-checkbox {
  transform: scale(.96);
  border-color: var(--subject-color);
  color: #fff;
  background: var(--subject-color);
}

.item-label input:focus-visible + .custom-checkbox {
  outline: 3px solid color-mix(in srgb, var(--subject-color) 38%, transparent);
  outline-offset: 2px;
}

.item-name {
  min-width: 0;
  overflow: hidden;
  color: var(--text);
  font: 550 15px/1.45 var(--font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color .18s ease;
}

.completed .item-name {
  color: var(--muted);
  text-decoration: line-through;
  text-decoration-color: color-mix(in srgb, var(--subject-color) 55%, var(--muted));
}

.item-meta {
  justify-self: end;
  min-width: 0;
  max-width: 100%;
}

.item-subject {
  position: relative;
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  color: var(--muted);
  font-size: 10px;
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-subject::before {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--subject-color);
  content: '';
}

.completed {
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--subject-color) 5%, var(--surface)),
    var(--surface) 62%
  );
}

@media (max-width: 850px) {
  .study-items {
    grid-template-columns: minmax(0, 1fr);
  }

  .add-form {
    flex-wrap: wrap;
  }

  .add-form input {
    flex: 1 1 100%;
  }

  .add-form select,
  .add-form .primary-button {
    flex: 1 1 auto;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 520px) {
  .add-form {
    align-items: stretch;
    flex-direction: column;
    padding: 15px;
  }

  .add-form .primary-button,
  .add-form select {
    width: 100%;
  }

  .study-items {
    padding: 15px;
  }

  .study-item {
    min-height: 80px;
    padding: 12px 12px 12px 14px;
  }

  .study-item {
    grid-template-columns: 34px minmax(0, 1fr) minmax(64px, 31%);
    gap: 9px;
  }

  .topic-index {
    width: 34px;
    height: 34px;
  }

  .item-subject {
    font-size: 8px;
  }
}
</style>
