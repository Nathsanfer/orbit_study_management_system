<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  deleteEssay,
  loadEssay,
  saveEssayEvaluation,
  saveEssayText,
  updateEssayDetails,
} from '@/data/essays.js';
import { getErrorMessage } from '@/lib/supabase.js';

const route = useRoute();
const router = useRouter();
const essay = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const showEvaluationDialog = ref(false);
const isSavingEvaluation = ref(false);
const evaluationErrorMessage = ref('');
const evaluationScore = ref('');
const evaluationFeedback = ref('');
const evaluationCompetencies = ref([]);
const essayText = ref('');
const essayTitle = ref('');
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const editTheme = ref('');
const editTitle = ref('');
const isSavingDetails = ref(false);
const isDeleting = ref(false);
const editErrorMessage = ref('');
const deleteErrorMessage = ref('');
const textSaveStatus = ref('saved');
const textSaveError = ref('');
let textSaveTimer = null;
let textSaveQueue = Promise.resolve();
const competencyDefinitions = [
  {
    name: 'Domínio da norma culta',
    description: 'Avalia se você escreve de acordo com a modalidade escrita formal da língua portuguesa. São observados aspectos como ortografia, acentuação, pontuação, concordância verbal e nominal, regência, além da escolha adequada de vocabulário.',
  },
  {
    name: 'Compreensão do tema e estrutura',
    description: 'Verifica se você entendeu a proposta de redação sem fugir ou tangenciar o tema e se aplicou repertório sociocultural dentro da estrutura dissertativo-argumentativa: introdução, desenvolvimento e conclusão.',
  },
  {
    name: 'Seleção e organização de argumentos',
    description: 'Analisa sua capacidade de selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.',
  },
  {
    name: 'Coesão textual',
    description: 'Avalia o conhecimento dos mecanismos linguísticos necessários para ligar frases e parágrafos por meio de conectivos, garantindo fluidez e evitando repetições excessivas.',
  },
  {
    name: 'Proposta de intervenção',
    description: 'Exige uma proposta de solução para o problema abordado, respeitando os direitos humanos e apresentando ação, agente, meio/modo, efeito/finalidade e detalhamento.',
  },
];

const competencies = computed(() => competencyDefinitions.map((definition, index) => {
  const competency = essay.value?.competencies?.find(
    (item) => item.name === `Competência ${index + 1}`,
  );
  return {
    number: index + 1,
    ...definition,
    score: competency?.score ?? null,
    feedback: competency?.feedback ?? '',
  };
}));

function openEvaluationDialog() {
  evaluationScore.value = essay.value.score === null ? '' : String(essay.value.score);
  evaluationFeedback.value = essay.value.feedback ?? '';
  evaluationCompetencies.value = competencies.value.map((competency) => ({
    number: competency.number,
    name: competency.name,
    score: competency.score === null ? '' : String(competency.score),
  }));
  evaluationErrorMessage.value = '';
  showEvaluationDialog.value = true;
}

function closeEvaluationDialog() {
  if (isSavingEvaluation.value) return;
  showEvaluationDialog.value = false;
  evaluationErrorMessage.value = '';
}

function openEditDialog() {
  editTheme.value = essay.value.theme ?? '';
  editTitle.value = essayTitle.value;
  editErrorMessage.value = '';
  showEditDialog.value = true;
}

function closeEditDialog() {
  if (isSavingDetails.value) return;
  showEditDialog.value = false;
  editErrorMessage.value = '';
}

async function saveEssayDetails() {
  const theme = editTheme.value.trim();
  if (!theme) {
    editErrorMessage.value = 'Informe o tema da redação.';
    return;
  }

  isSavingDetails.value = true;
  editErrorMessage.value = '';
  try {
    const updatedEssay = await updateEssayDetails(
      essay.value.id,
      theme,
      editTitle.value.trim(),
    );
    essay.value = updatedEssay;
    essayTitle.value = updatedEssay.title ?? '';
    showEditDialog.value = false;
  } catch (error) {
    editErrorMessage.value = getErrorMessage(error);
  } finally {
    isSavingDetails.value = false;
  }
}

function openDeleteDialog() {
  deleteErrorMessage.value = '';
  showDeleteDialog.value = true;
}

function closeDeleteDialog() {
  if (isDeleting.value) return;
  showDeleteDialog.value = false;
  deleteErrorMessage.value = '';
}

async function confirmDeleteEssay() {
  if (!essay.value || isDeleting.value) return;

  isDeleting.value = true;
  deleteErrorMessage.value = '';
  try {
    await deleteEssay(essay.value.id);
    showDeleteDialog.value = false;
    await router.replace({ name: 'essays' });
  } catch (error) {
    deleteErrorMessage.value = getErrorMessage(error);
  } finally {
    isDeleting.value = false;
  }
}

async function saveEvaluation() {
  const score = Number(evaluationScore.value);
  const competencyScores = evaluationCompetencies.value.map((competency) => ({
    number: competency.number,
    score: Number(competency.score),
  }));

  if (!Number.isInteger(score) || score < 0 || score > 1000) {
    evaluationErrorMessage.value = 'Informe uma nota geral entre 0 e 1000.';
    return;
  }

  if (competencyScores.some((competency) =>
    !Number.isInteger(competency.score) || competency.score < 0 || competency.score > 200
  )) {
    evaluationErrorMessage.value = 'Informe uma nota entre 0 e 200 para cada competência.';
    return;
  }

  isSavingEvaluation.value = true;
  evaluationErrorMessage.value = '';
  try {
    await saveEssayEvaluation({
      essayId: essay.value.id,
      evaluationId: essay.value.evaluationId,
      score,
      feedback: evaluationFeedback.value.trim(),
      competencies: competencyScores.map((competency) => ({
        ...competency,
        feedback: essay.value.competencies.find(
          (item) => item.name === `Competência ${competency.number}`,
        )?.feedback ?? '',
      })),
    });
    await loadCurrentEssay();
    showEvaluationDialog.value = false;
  } catch (error) {
    evaluationErrorMessage.value = getErrorMessage(error);
  } finally {
    isSavingEvaluation.value = false;
  }
}

async function loadCurrentEssay() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    essay.value = await loadEssay(route.params.id);
    essayText.value = essay.value?.text ?? '';
    essayTitle.value = essay.value?.title ?? '';
    textSaveStatus.value = 'saved';
    textSaveError.value = '';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCurrentEssay);
watch(() => route.params.id, loadCurrentEssay);

function scheduleEssayTextSave() {
  if (!essay.value) return;

  textSaveStatus.value = 'saving';
  textSaveError.value = '';
  if (textSaveTimer) clearTimeout(textSaveTimer);

  textSaveTimer = setTimeout(() => {
    textSaveTimer = null;
    void saveEssayTextSnapshot();
  }, 650);
}

async function saveEssayTextSnapshot() {
  if (!essay.value) return;

  const text = essayText.value;
  const title = essayTitle.value.trim();
  const save = textSaveQueue.then(
    () => saveEssayText(essay.value.id, text, title),
    () => saveEssayText(essay.value.id, text, title),
  );
  textSaveQueue = save;

  try {
    await save;
    essay.value.text = text;
    essay.value.title = title;
    textSaveStatus.value = 'saved';
  } catch (error) {
    textSaveStatus.value = 'error';
    textSaveError.value = getErrorMessage(error);
  }
}

onBeforeUnmount(() => {
  if (textSaveTimer) {
    clearTimeout(textSaveTimer);
    textSaveTimer = null;
  }
  if (textSaveStatus.value === 'saving') {
    void saveEssayTextSnapshot();
  }
});
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
      <div class="detail-actions">
        <button class="edit-essay-button" type="button" @click="openEditDialog">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10.8 2.7 13.3 5.2 6 12.5l-3.5.5.5-3.5 7.8-6.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          </svg>
          Editar
        </button>
        <button class="delete-essay-button" type="button" aria-label="Excluir redação" @click="openDeleteDialog">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 4.5h9M6 2.5h4M5 4.5l.5 9h5l.5-9M7 7v4M9 7v4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Excluir
        </button>
        <button class="register-score-button" type="button" @click="openEvaluationDialog">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          {{ essay.score === null ? 'Registrar nota' : 'Editar nota' }}
        </button>
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
          <span class="essay-save-status" :class="textSaveStatus">
            {{ textSaveStatus === 'saving' ? 'Salvando...' : textSaveStatus === 'error' ? 'Não foi possível salvar' : 'Texto salvo' }}
          </span>
        </div>
        <div class="essay-title-field">
          <label for="essay-title">Título</label>
          <input
            id="essay-title"
            v-model="essayTitle"
            type="text"
            maxlength="120"
            placeholder="Adicione um título à sua redação"
            @input="scheduleEssayTextSave"
          />
        </div>
        <textarea
          v-model="essayText"
          class="essay-text-editor"
          placeholder="Comece a escrever sua redação aqui..."
          aria-label="Texto da redação"
          @input="scheduleEssayTextSave"
        ></textarea>
        <p v-if="textSaveError" class="essay-save-error" role="alert">
          Não foi possível salvar o texto: {{ textSaveError }}
        </p>
      </article>

      <aside class="evaluation-sidebar" aria-label="Avaliação da redação">
        <section class="final-score-card" aria-labelledby="final-score-title">
          <div>
            <p id="final-score-title" class="page-eyebrow">Resultado</p>
            <h2>Nota final</h2>
          </div>
          <strong v-if="essay.score !== null" class="final-score">
            {{ essay.score }}<small>/1000</small>
          </strong>
          <strong v-else class="pending-score">Pendente</strong>
        </section>

        <section class="competencies-card" aria-labelledby="competencies-title">
          <div class="competencies-heading">
            <div>
              <p class="page-eyebrow">Avaliação por competência</p>
              <h2 id="competencies-title">Cinco competências</h2>
            </div>
          </div>

          <article
            v-for="competency in competencies"
            :key="competency.number"
            class="competency-card"
          >
            <div class="competency-topline">
              <span class="competency-number">0{{ competency.number }}</span>
              <h3>Competência {{ competency.number }}: {{ competency.name }}</h3>
              <strong>
                {{ competency.score ?? '0/200' }}<small v-if="competency.score !== null">/200</small>
              </strong>
            </div>
            <p>{{ competency.description }}</p>
            <p v-if="competency.feedback" class="competency-feedback">{{ competency.feedback }}</p>
          </article>

          <p v-if="essay.feedback" class="evaluation-feedback">{{ essay.feedback }}</p>
        </section>
      </aside>
    </div>

    <div
      v-if="showEditDialog"
      class="essay-edit-backdrop"
      @click.self="closeEditDialog"
      @keydown.esc="closeEditDialog"
    >
      <section
        class="essay-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="essay-edit-title"
      >
        <div class="essay-edit-heading">
          <div>
            <p class="page-eyebrow">Informações da redação</p>
            <h2 id="essay-edit-title">Editar redação</h2>
          </div>
          <button
            class="essay-edit-close"
            type="button"
            aria-label="Fechar"
            :disabled="isSavingDetails"
            @click="closeEditDialog"
          >
            ×
          </button>
        </div>

        <form class="essay-edit-form" @submit.prevent="saveEssayDetails">
          <p v-if="editErrorMessage" class="essay-edit-error" role="alert">
            {{ editErrorMessage }}
          </p>
          <label for="edit-essay-theme">Tema</label>
          <input
            id="edit-essay-theme"
            v-model="editTheme"
            type="text"
            maxlength="250"
            required
            autofocus
          />
          <label for="edit-essay-title">Título <span>(opcional)</span></label>
          <input
            id="edit-essay-title"
            v-model="editTitle"
            type="text"
            maxlength="120"
            placeholder="Dê um título à sua redação"
          />
          <div class="essay-edit-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="isSavingDetails"
              @click="closeEditDialog"
            >
              Cancelar
            </button>
            <button class="primary-button" type="submit" :disabled="isSavingDetails">
              {{ isSavingDetails ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div
      v-if="showDeleteDialog"
      class="essay-edit-backdrop"
      @click.self="closeDeleteDialog"
      @keydown.esc="closeDeleteDialog"
    >
      <section
        class="essay-edit-dialog delete-essay-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="essay-delete-title"
      >
        <div class="essay-edit-heading">
          <div>
            <p class="page-eyebrow">Ação permanente</p>
            <h2 id="essay-delete-title">Excluir redação?</h2>
          </div>
          <button
            class="essay-edit-close"
            type="button"
            aria-label="Fechar"
            :disabled="isDeleting"
            @click="closeDeleteDialog"
          >
            ×
          </button>
        </div>
        <p class="delete-essay-copy">
          A redação <strong>{{ essayTitle || essay.theme }}</strong> e sua avaliação serão excluídas permanentemente.
        </p>
        <p v-if="deleteErrorMessage" class="essay-edit-error" role="alert">
          Não foi possível excluir a redação: {{ deleteErrorMessage }}
        </p>
        <div class="essay-edit-actions">
          <button
            class="secondary-button"
            type="button"
            :disabled="isDeleting"
            @click="closeDeleteDialog"
          >
            Cancelar
          </button>
          <button
            class="danger-button"
            type="button"
            :disabled="isDeleting"
            @click="confirmDeleteEssay"
          >
            {{ isDeleting ? 'Excluindo...' : 'Excluir redação' }}
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="showEvaluationDialog"
      class="evaluation-modal-backdrop"
      @click.self="closeEvaluationDialog"
      @keydown.esc="closeEvaluationDialog"
    >
      <section
        class="evaluation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evaluation-dialog-title"
      >
        <div class="evaluation-modal-heading">
          <div>
            <p class="page-eyebrow">Avaliação da redação</p>
            <h2 id="evaluation-dialog-title">
              {{ essay.score === null ? 'Registrar nota' : 'Editar nota' }}
            </h2>
          </div>
          <button
            class="evaluation-modal-close"
            type="button"
            aria-label="Fechar"
            :disabled="isSavingEvaluation"
            @click="closeEvaluationDialog"
          >
            ×
          </button>
        </div>

        <form class="evaluation-form" @submit.prevent="saveEvaluation">
          <p v-if="evaluationErrorMessage" class="request-error" role="alert">
            {{ evaluationErrorMessage }}
          </p>

          <label for="general-score">Nota geral</label>
          <div class="score-input-wrap">
            <input
              id="general-score"
              v-model="evaluationScore"
              type="number"
              min="0"
              max="1000"
              step="1"
              required
            />
            <span>/1000</span>
          </div>

          <div class="competency-score-fields">
            <label
              v-for="competency in evaluationCompetencies"
              :key="competency.number"
              :for="`competency-score-${competency.number}`"
            >
              <span>Competência {{ competency.number }}: {{ competency.name }}</span>
              <div class="score-input-wrap">
                <input
                  :id="`competency-score-${competency.number}`"
                  v-model="competency.score"
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  required
                />
                <span>/200</span>
              </div>
            </label>
          </div>

          <label for="evaluation-feedback">Observação geral <span>(opcional)</span></label>
          <textarea
            id="evaluation-feedback"
            v-model="evaluationFeedback"
            rows="3"
            placeholder="Escreva um comentário sobre a avaliação..."
          ></textarea>

          <div class="evaluation-modal-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="isSavingEvaluation"
              @click="closeEvaluationDialog"
            >
              Cancelar
            </button>
            <button class="primary-button" type="submit" :disabled="isSavingEvaluation">
              {{ isSavingEvaluation ? 'Salvando...' : 'Salvar nota' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <RouterLink class="back-link" :to="{ name: 'essays' }">← Voltar para redações</RouterLink>
  </section>

  <section v-else-if="isLoading" class="empty-state" role="status">Carregando redação...</section>

  <section v-else-if="errorMessage" class="empty-state" role="alert">
    <h1>Não foi possível carregar a redação</h1>
    <p>{{ errorMessage }}</p>
    <RouterLink class="primary-button" :to="{ name: 'essays' }">Voltar para redações</RouterLink>
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

.detail-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.edit-essay-button,
.delete-essay-button,
.register-score-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.edit-essay-button {
  border: 1px solid var(--border);
  color: var(--text-soft);
  background: var(--surface);
}

.edit-essay-button:hover {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  color: var(--accent);
  background: var(--accent-soft);
}

.delete-essay-button {
  border: 1px solid color-mix(in srgb, #b54747 24%, var(--border));
  color: #b54747;
  background: var(--surface);
}

.delete-essay-button:hover {
  border-color: #b54747;
  background: color-mix(in srgb, #b54747 8%, var(--surface));
}

.page-title {
  max-width: 760px;
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(29px, 3vw, 38px)/1.18 var(--font-title);
  letter-spacing: -.035em;
}

.register-score-button {
  display: inline-flex;
  min-height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.register-score-button:hover {
  background: var(--accent-hover);
}

:global(:root[data-theme='dark']) .register-score-button {
  color: #241a20;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr);
  align-items: start;
  gap: 17px;
}

.essay-paper,
.final-score-card,
.competencies-card {
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

.essay-save-status {
  margin-left: auto;
  color: var(--muted);
  font-size: 9px;
}

.essay-save-status.saving {
  color: var(--accent);
}

.essay-save-status.error,
.essay-save-error {
  color: #b54747;
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

.essay-title-field {
  display: grid;
  gap: 7px;
  width: 100%;
  margin: 18px 0 2px;
  padding: 12px 14px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 55%, var(--surface)), var(--surface));
  box-shadow: 0 5px 16px rgb(36 24 39 / 4%);
}

.essay-title-field label {
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .02em;
}

.essay-title-field input {
  width: 100%;
  min-height: 50px;
  padding: 8px 2px 10px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
  border-radius: 0;
  color: var(--text);
  background: transparent;
  font: 500 clamp(21px, 2.1vw, 28px)/1.2 var(--font-title);
  letter-spacing: -.025em;
  outline: 0;
  transition: border-color .18s ease;
}

.essay-title-field input::placeholder {
  color: var(--muted);
  opacity: .72;
}

.essay-title-field input:focus {
  border-bottom-color: var(--accent);
}

.essay-text {
  padding-top: 7px;
}

.essay-text-editor {
  width: 100%;
  min-height: 520px;
  margin-top: 12px;
  padding: 18px 4px;
  border: 0;
  resize: vertical;
  color: var(--text-soft);
  background: transparent;
  font: 11px/1.85 var(--font-body);
  text-align: justify;
  outline: 0;
}

.essay-text-editor::placeholder {
  color: var(--muted);
}

.essay-save-error {
  margin: 8px 0 0;
  font-size: 9px;
  line-height: 1.5;
}

.essay-text p {
  margin: 15px 0;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.85;
  text-align: justify;
}

.evaluation-sidebar {
  display: grid;
  gap: 17px;
}

.final-score-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-color: color-mix(in srgb, var(--accent) 22%, var(--border));
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
}

.final-score-card .page-eyebrow {
  margin: 0;
  font-size: 8px;
}

.final-score-card h2 {
  margin: 4px 0 0;
  color: var(--text);
  font: 500 19px var(--font-title);
}

.final-score {
  color: var(--accent);
  font: 500 29px var(--font-title);
}

.final-score small {
  margin-left: 3px;
  color: var(--muted);
  font: 400 9px var(--font-body);
}

.pending-score {
  color: var(--muted);
  font-size: 14px;
}

.competencies-card {
  padding: 20px;
}

.competencies-heading {
  margin-bottom: 4px;
}

.competencies-heading .page-eyebrow {
  margin: 0;
  font-size: 8px;
}

.competencies-heading h2 {
  margin: 4px 0 12px;
  color: var(--text);
  font: 500 19px var(--font-title);
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
  font-size: 10px;
  line-height: 1.65;
}

.evaluation-feedback,
.empty-copy {
  color: var(--text-soft);
  font-size: 10px;
  line-height: 1.65;
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

.essay-edit-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 20px;
  background: rgb(31 20 34 / 48%);
  backdrop-filter: blur(4px);
}

.essay-edit-dialog {
  width: min(100%, 520px);
  max-height: min(90vh, 760px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: 0 24px 70px rgb(21 12 23 / 25%);
}

.essay-edit-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.essay-edit-heading .page-eyebrow {
  margin: 0;
}

.essay-edit-heading h2 {
  margin: 4px 0 0;
  color: var(--text);
  font: 500 24px var(--font-title);
}

.essay-edit-close {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--surface);
  font-size: 18px;
  cursor: pointer;
}

.essay-edit-form {
  display: grid;
  gap: 9px;
}

.essay-edit-form label {
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.essay-edit-form label span {
  color: var(--muted);
  font-weight: 400;
}

.essay-edit-form input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font-size: 11px;
}

.essay-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 12px;
}

.essay-edit-error,
.delete-essay-copy {
  margin: 0 0 14px;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.6;
}

.essay-edit-error {
  color: #b54747;
}

.delete-essay-copy strong {
  color: var(--text);
}

.danger-button {
  min-height: 40px;
  padding: 0 15px;
  border: 1px solid #b54747;
  border-radius: 8px;
  color: #fff;
  background: #b54747;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}

.danger-button:hover:not(:disabled) {
  background: #9d3838;
}

.danger-button:disabled {
  opacity: .62;
  cursor: not-allowed;
}

.evaluation-modal-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 20px;
  background: rgb(31 20 34 / 48%);
  backdrop-filter: blur(4px);
}

.evaluation-modal {
  width: min(100%, 520px);
  max-height: min(90vh, 760px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: 0 24px 70px rgb(21 12 23 / 25%);
}

.evaluation-modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.evaluation-modal-heading .page-eyebrow {
  margin: 0;
}

.evaluation-modal-heading h2 {
  margin: 4px 0 0;
  color: var(--text);
  font: 500 24px var(--font-title);
}

.evaluation-modal-close {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--surface);
  font-size: 18px;
  cursor: pointer;
}

.evaluation-form {
  display: grid;
  gap: 9px;
}

.evaluation-form label {
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.evaluation-form label span {
  color: var(--muted);
  font-weight: 400;
}

.evaluation-form input,
.evaluation-form textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font-size: 11px;
}

.evaluation-form input {
  height: 40px;
  padding: 0 10px;
}

.evaluation-form textarea {
  min-height: 76px;
  padding: 10px;
  resize: vertical;
}

.score-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-input-wrap input {
  min-width: 110px;
}

.score-input-wrap span {
  color: var(--muted);
  font-size: 9px;
}

.competency-score-fields {
  display: grid;
  gap: 9px;
  margin: 5px 0;
}

.competency-score-fields label {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 145px;
  align-items: center;
  gap: 12px;
}

.evaluation-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 12px;
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

  .detail-actions {
    width: 100%;
  }

  .detail-actions button {
    flex: 1;
  }

  .register-score-button {
    width: 100%;
  }

  .essay-paper,
  .competencies-card,
  .final-score-card {
    padding: 17px;
  }

  .competency-score-fields label {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
