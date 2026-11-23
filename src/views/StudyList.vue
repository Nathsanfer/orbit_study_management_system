<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { loadSubjects, subjects } from '@/data/subjects.js';
import { getErrorMessage, getSupabase } from '@/lib/supabase.js';

const items = ref([]);
const newItem = ref('');
const selectedSubjectId = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const remainingCount = computed(() => items.value.filter((item) => !item.done).length);

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
      <div class="list-summary">
        <div>
          <span class="summary-label">Seu próximo passo</span>
          <strong>{{ remainingCount }} {{ remainingCount === 1 ? 'item pendente' : 'itens pendentes' }}</strong>
        </div>
        <span class="summary-mark" aria-hidden="true">✦</span>
      </div>

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
        <li v-for="item in items" :key="item.id" class="study-item" :class="{ completed: item.done }">
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
            <span class="item-status">{{ item.done ? 'Concluído' : 'Para estudar' }}</span>
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

.list-summary {
  display: flex;
  min-height: 89px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--accent) 5%, var(--surface));
}

.summary-label {
  display: block;
  margin-bottom: 5px;
  color: var(--muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.list-summary strong {
  color: var(--text);
  font: 500 20px var(--font-title);
}

.summary-mark {
  color: var(--accent);
  font-size: 22px;
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
  margin: 0;
  padding: 0 22px;
  list-style: none;
}

.study-item {
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.study-item:last-child {
  border-bottom: 0;
}

.item-label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
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
  width: 21px;
  height: 21px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: transparent;
  background: var(--surface);
  transition: background .18s ease, color .18s ease, border-color .18s ease;
}

.item-label input:checked + .custom-checkbox {
  border-color: var(--accent);
  color: #fff;
  background: var(--accent);
}

.item-label input:focus-visible + .custom-checkbox {
  outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent);
  outline-offset: 2px;
}

.item-name {
  overflow: hidden;
  color: var(--text);
  font-size: 12px;
  text-overflow: ellipsis;
}

.completed .item-name {
  color: var(--muted);
  text-decoration: line-through;
}

.item-status {
  flex: 0 0 auto;
  padding: 5px 9px;
  border-radius: 20px;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 9px;
}

.item-meta {
  display: grid;
  justify-items: end;
  gap: 5px;
}

.item-subject {
  color: var(--muted);
  font-size: 8px;
}

.completed .item-status {
  color: var(--accent);
  background: var(--accent-soft);
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
    padding-inline: 15px;
  }

  .study-item {
    min-height: 61px;
  }

  .item-label {
    gap: 9px;
  }

  .item-status {
    padding: 5px 7px;
    font-size: 8px;
  }
}
</style>
