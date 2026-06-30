<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'changePage', page: number): void
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages } = props

  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  if (currentPage <= 2) {
    pages.push(1, 2, 3, '...', totalPages)
  } else if (currentPage >= totalPages - 1) {
    pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
  } else {
    pages.push(1, '...', currentPage, '...', totalPages)
  }

  return pages
})

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    emit('changePage', page)
  }
}

const goPrev = () => {
  if (props.currentPage > 1) {
    emit('changePage', props.currentPage - 1)
  }
}

const goNext = () => {
  if (props.currentPage < props.totalPages) {
    emit('changePage', props.currentPage + 1)
  }
}
</script>

<template>
  <div class="pagination">
    <button
      class="page-btn nav-btn"
      :disabled="currentPage === 1"
      @click="goPrev"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Précédent
    </button>

    <div class="page-numbers">
      <button
        v-for="(page, index) in visiblePages"
        :key="index"
        :class="[
          'page-btn',
          { active: page === currentPage },
          { dots: page === '...' }
        ]"
        @click="page === '...' ? (index < visiblePages.length / 2 ? goPrev() : goNext()) : goToPage(page)"
      >
        <template v-if="page === '...'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </template>
        <template v-else>{{ page }}</template>
      </button>
    </div>

    <button
      class="page-btn nav-btn"
      :disabled="currentPage === totalPages"
      @click="goNext"
    >
      Suivant
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <div class="page-info">
      <span>Page <strong>{{ currentPage }}</strong> sur {{ totalPages }}</span>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-600);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled):not(.active):not(.dots) {
  background: var(--neutral-100);
  border-color: var(--neutral-300);
  color: var(--neutral-800);
}

.page-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.dots {
  cursor: pointer;
  padding: 0 6px;
}

.page-btn.dots:hover {
  background: var(--neutral-100);
}

.page-btn.dots svg {
  width: 16px;
  height: 16px;
}

.nav-btn {
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
}

.nav-btn svg {
  width: 14px;
  height: 14px;
}

.page-info {
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--neutral-200);
  font-size: 13px;
  color: var(--neutral-500);
}

.page-info strong {
  color: var(--neutral-700);
}
</style>
