<script setup lang="ts">
import { ref } from 'vue'

const exportFormat = ref('csv')
const exportScope = ref('current')

const handleExport = () => {
  // Logique d'export à implémenter
}
</script>

<template>
  <div class="export-bar">
    <div class="export-left">
      <span class="export-label">Exporter les données</span>
    </div>
    <div class="export-controls">
      <div class="export-group">
        <label>Format</label>
        <div class="select-wrapper">
          <select v-model="exportFormat">
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div class="export-group">
        <label>Portée</label>
        <div class="select-wrapper">
          <select v-model="exportScope">
            <option value="current">Page actuelle</option>
            <option value="all">Toutes les pages</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <button class="export-btn" @click="handleExport">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exporter
      </button>
    </div>
  </div>
</template>

<style scoped>
.export-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
}

.export-left {
  display: flex;
  align-items: center;
}

.export-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--neutral-700);
}

.export-controls {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.export-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.export-group label {
  font-size: 11px;
  font-weight: 600;
  color: var(--neutral-500);
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
  min-width: 140px;
  padding: 8px 28px 8px 10px;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  background: white;
  font-size: 13px;
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
  right: 8px;
  width: 12px;
  height: 12px;
  color: var(--neutral-500);
  pointer-events: none;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.export-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.export-btn svg {
  width: 14px;
  height: 14px;
}
</style>
