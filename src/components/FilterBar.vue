<script setup lang="ts">
defineProps<{
  clusters: string[]
  folders: string[]
  cluster: string
  folder: string
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  (e: 'update:cluster', value: string): void
  (e: 'update:folder', value: string): void
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
}>()
</script>

<template>
  <div class="filter-bar">
    <div class="filter-group">
      <label>Cluster</label>
      <div class="select-wrapper">
        <select :value="cluster" @change="emit('update:cluster', ($event.target as HTMLSelectElement).value)">
          <option value="">Tous les clusters</option>
          <option v-for="c in clusters" :key="c" :value="c">{{ c }}</option>
        </select>
        <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>

    <div class="filter-group">
      <label>Dossier</label>
      <div class="select-wrapper">
        <select :value="folder" @change="emit('update:folder', ($event.target as HTMLSelectElement).value)">
          <option value="">Tous les dossiers</option>
          <option v-for="f in folders" :key="f" :value="f">{{ f }}</option>
        </select>
        <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>

    <div class="filter-group date-group">
      <label>Période</label>
      <div class="date-inputs">
        <div class="date-wrapper">
          <input
            type="date"
            :value="startDate"
            @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <span class="date-separator">à</span>
        <div class="date-wrapper">
          <input
            type="date"
            :value="endDate"
            @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <button class="reset-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      Réinitialiser
    </button>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper select {
  appearance: none;
  min-width: 180px;
  padding: 9px 32px 9px 12px;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  background: white;
  font-size: 14px;
  color: var(--neutral-700);
  cursor: pointer;
  transition: all 0.2s;
}

.select-wrapper select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.select-arrow {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  color: var(--neutral-500);
  pointer-events: none;
}

.date-group {
  flex: 1;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-wrapper input {
  padding: 9px 12px;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  background: white;
  font-size: 14px;
  color: var(--neutral-700);
  transition: all 0.2s;
}

.date-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.date-separator {
  font-size: 13px;
  color: var(--neutral-500);
  font-weight: 500;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: var(--neutral-100);
  color: var(--neutral-600);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.reset-btn:hover {
  background: var(--neutral-200);
  color: var(--neutral-700);
}

.reset-btn svg {
  width: 14px;
  height: 14px;
}
</style>
