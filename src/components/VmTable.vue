<script setup>
import { ref } from 'vue'

const props = defineProps({
  selectedVcenter: { type: String, required: true }
})

const sortColumn = ref('')
const sortDirection = ref('asc')

const vms = ref([
  { name: 'VM-WEB-01', cpu: 4, ram: 16, storage: 500, os: 'Windows Server 2022', cluster: 'Cluster-A', folder: 'Production', createdAt: '2023-01-15' },
  { name: 'VM-DB-01', cpu: 8, ram: 32, storage: 1024, os: 'Ubuntu 22.04 LTS', cluster: 'Cluster-A', folder: 'Production', createdAt: '2023-02-20' },
  { name: 'VM-APP-01', cpu: 2, ram: 8, storage: 250, os: 'CentOS 8', cluster: 'Cluster-B', folder: 'Test', createdAt: '2023-03-10' },
  { name: 'VM-WEB-02', cpu: 4, ram: 16, storage: 500, os: 'Windows Server 2019', cluster: 'Cluster-A', folder: 'Production', createdAt: '2023-04-05' },
  { name: 'VM-DEV-01', cpu: 2, ram: 4, storage: 120, os: 'Debian 11', cluster: 'Cluster-C', folder: 'Development', createdAt: '2023-05-12' },
  { name: 'VM-TEST-01', cpu: 2, ram: 8, storage: 200, os: 'Ubuntu 20.04 LTS', cluster: 'Cluster-B', folder: 'Test', createdAt: '2023-06-18' },
  { name: 'VM-PROD-02', cpu: 16, ram: 64, storage: 2048, os: 'Windows Server 2022', cluster: 'Cluster-A', folder: 'Production', createdAt: '2023-07-22' },
  { name: 'VM-STAGING-01', cpu: 4, ram: 16, storage: 500, os: 'Rocky Linux 9', cluster: 'Cluster-D', folder: 'Staging', createdAt: '2023-08-30' },
  { name: 'VM-ARCHIVE-01', cpu: 2, ram: 4, storage: 1000, os: 'Ubuntu 22.04 LTS', cluster: 'Cluster-C', folder: 'Archive', createdAt: '2023-09-14' },
  { name: 'VM-WEB-03', cpu: 4, ram: 16, storage: 500, os: 'Windows Server 2022', cluster: 'Cluster-A', folder: 'Production', createdAt: '2023-10-01' },
])

const columns = [
  { key: 'name', label: 'Nom VM' },
  { key: 'cpu', label: 'CPU' },
  { key: 'ram', label: 'RAM (GB)' },
  { key: 'storage', label: 'Stockage (GB)' },
  { key: 'os', label: 'OS' },
  { key: 'cluster', label: 'Cluster' },
  { key: 'folder', label: 'Dossier' },
  { key: 'createdAt', label: 'Date de création' },
]

const handleSort = (key) => {
  if (sortColumn.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = key
    sortDirection.value = 'asc'
  }
}

const getOsIcon = (os) => {
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
</script>

<template>
  <div class="table-container">
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
          <tr v-for="(vm, index) in vms" :key="index" class="table-row">
            <td class="cell-name">
              <div class="vm-name">
                <span class="vm-icon">🖥️</span>
                <span class="name-text">{{ vm.name }}</span>
              </div>
            </td>
            <td class="cell-cpu">
              <div class="metric">
                <span class="metric-value">{{ vm.cpu }}</span>
                <span class="metric-unit">vCPU</span>
              </div>
            </td>
            <td class="cell-ram">
              <div class="metric">
                <span class="metric-value">{{ vm.ram }}</span>
                <span class="metric-unit">GB</span>
              </div>
            </td>
            <td class="cell-storage">
              <div class="metric">
                <span class="metric-value">{{ vm.storage }}</span>
                <span class="metric-unit">GB</span>
              </div>
            </td>
            <td class="cell-os">
              <div class="os-info">
                <span class="os-icon">{{ getOsIcon(vm.os) }}</span>
                <span class="os-name">{{ vm.os }}</span>
              </div>
            </td>
            <td class="cell-cluster">
              <span class="cluster-badge">{{ vm.cluster }}</span>
            </td>
            <td class="cell-folder">
              <span class="folder-badge" :class="getFolderBadge(vm.folder)">{{ vm.folder }}</span>
            </td>
            <td class="cell-date">
              <span class="date-text">{{ vm.createdAt }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <span class="results-count">Affichage de <strong>{{ vms.length }}</strong> VMs</span>
    </div>
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
  min-width: 160px;
}

.vm-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vm-icon {
  font-size: 18px;
}

.name-text {
  font-weight: 600;
  color: var(--neutral-800);
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
