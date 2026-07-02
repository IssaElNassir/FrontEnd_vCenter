<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'Aucune donnée.' }
})

const sortColumn = ref('')
const sortDirection = ref('asc')

const columns = [
  { key: 'name', label: 'Nom VM' },
  { key: 'cpu_count', label: 'CPU' },
  { key: 'ram', label: 'RAM (GB)' },
  { key: 'storage_gb', label: 'Stockage (GB)' },
  { key: 'os', label: 'OS' },
  { key: 'cluster_name', label: 'Cluster' },
  { key: 'folder_main', label: 'Dossier' },
  { key: 'creation_date', label: 'Date de création' },
]

const handleSort = (key) => {
  if (sortColumn.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = key
    sortDirection.value = 'asc'
  }
}

const getVmRam = (vm) => {
  const value = vm.memory_size_MiB ?? vm.memory?.size_MiB
  if (value == null) return '-'
  return `${(Number(value) / 1024).toFixed(1)}`
}

const formatDate = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('fr-FR')
}

const getOsIcon = (os) => {
  if (!os) return ''
  if (os.includes('Windows')) return '🪟'
  if (os.includes('Ubuntu') || os.includes('Debian')) return '🐧'
  if (os.includes('CentOS') || os.includes('Rocky')) return '🐧'
  return '💻'
}

const getFolderBadge = (folder) => {
  const colors = {
    'Production': 'production',
    'Test': 'test',
    'Development': 'dev',
    'Staging': 'staging',
    'Archive': 'archive'
  }
  return colors[folder] || 'default'
}

const sortedRows = computed(() => {
  if (!sortColumn.value) return props.rows
  const col = sortColumn.value
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const aVal = a[col] ?? ''
    const bVal = b[col] ?? ''
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir
    }
    return String(aVal).localeCompare(String(bVal), 'fr') * dir
  })
})
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="table-loading">
      <div class="spinner"></div>
      <span>Chargement des machines virtuelles…</span>
    </div>

    <div v-else-if="rows.length === 0" class="table-empty">
      {{ emptyMessage }}
    </div>

    <template v-else>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                :class="{ sorted: sortColumn === col.key }"
                @click="handleSort(col.key)"
              >
                <div class="th-content">
                  <span>{{ col.label }}</span>
                  <span class="sort-icon" v-if="sortColumn === col.key">
                    <svg v-if="sortDirection === 'asc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(vm, index) in sortedRows" :key="vm.vm_uid || index" class="table-row">
              <td class="cell-name">
                <div class="vm-name">
                  <span class="vm-icon">🖥️</span>
                  <div class="name-block">
                    <span class="name-text">{{ vm.name || '-' }}</span>
                    <span v-if="vm.ipAddresses && vm.ipAddresses.length" class="ip-text">
                      {{ vm.ipAddresses.join(', ') }}
                    </span>
                  </div>
                  <span v-if="vm.hasChangesToday" class="change-badge">Modifié</span>
                </div>
              </td>
              <td class="cell-cpu">
                <div class="metric">
                  <span class="metric-value">{{ vm.cpu_count ?? vm.cpu?.count ?? '-' }}</span>
                  <span class="metric-unit">vCPU</span>
                </div>
              </td>
              <td class="cell-ram">
                <div class="metric">
                  <span class="metric-value">{{ getVmRam(vm) }}</span>
                  <span class="metric-unit">GB</span>
                </div>
              </td>
              <td class="cell-storage">
                <div class="metric">
                  <span class="metric-value">{{ vm.storage_gb ?? vm.storage ?? '-' }}</span>
                  <span class="metric-unit">GB</span>
                </div>
              </td>
              <td class="cell-os">
                <div class="os-info">
                  <span class="os-icon">{{ getOsIcon(vm.os) }}</span>
                  <span class="os-name">{{ vm.os || '-' }}</span>
                </div>
              </td>
              <td class="cell-cluster">
                <span class="cluster-badge">{{ vm.cluster_name || vm.cluster || '-' }}</span>
              </td>
              <td class="cell-folder">
                <span class="folder-badge" :class="getFolderBadge(vm.folder_main)">{{ vm.folder_main || '-' }}</span>
              </td>
              <td class="cell-date">
                <span class="date-text">{{ formatDate(vm.creation_date || vm.create_time || vm.creation_time) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="results-count">Affichage de <strong>{{ rows.length }}</strong> VMs</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.table-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-loading,
.table-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--neutral-500);
  font-size: 14px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--neutral-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-scroll {
  overflow: auto;
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

th {
  background: var(--neutral-50);
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--neutral-600);
  border-bottom: 1px solid var(--neutral-200);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  white-space: nowrap;
}

th:hover {
  background: var(--neutral-100);
}

th.sorted {
  color: var(--primary);
  background: rgba(14, 165, 233, 0.05);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-icon svg {
  width: 14px;
  height: 14px;
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--neutral-100);
  color: var(--neutral-700);
  vertical-align: middle;
}

.table-row {
  transition: background 0.15s;
}

.table-row:hover {
  background: rgba(14, 165, 233, 0.03);
}

.cell-name {
  min-width: 180px;
}

.vm-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vm-icon {
  font-size: 18px;
}

.name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-text {
  font-weight: 600;
  color: var(--neutral-800);
}

.ip-text {
  font-size: 11px;
  color: var(--neutral-500);
}

.change-badge {
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.metric {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.metric-value {
  font-weight: 700;
  color: var(--neutral-800);
  font-size: 15px;
}

.metric-unit {
  font-size: 12px;
  color: var(--neutral-500);
}

.os-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.os-icon {
  font-size: 16px;
}

.os-name {
  color: var(--neutral-700);
}

.cluster-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary-dark);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.folder-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.folder-badge.production {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
}

.folder-badge.test {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent);
}

.folder-badge.dev {
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary-dark);
}

.folder-badge.staging {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.folder-badge.archive {
  background: rgba(100, 116, 139, 0.1);
  color: var(--neutral-600);
}

.cell-date {
  white-space: nowrap;
}

.date-text {
  color: var(--neutral-500);
  font-size: 13px;
}

.table-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}

.results-count {
  font-size: 13px;
  color: var(--neutral-500);
}

.results-count strong {
  color: var(--neutral-700);
}
</style>
