<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import VmTable from './VmTable.vue'
import Pagination from './Pagination.vue'
import ExportBar from './ExportBar.vue'
import { getVcenterList, getVcenterClusters, getAllVmsWithClusterInfo, getVmsChangedToday, getVmsChangedTodayDetails, getVmHistoryEntries, getVmStorageBatch, getVmGuestNetworkingInterfaces, logout as logoutApi } from '../api/vcenter'
import { extractIpAddresses } from '../utils/networking'

const vcenters = ref([])
const selectedVcenter = ref(null)
const clusters = ref([])
const selectedCluster = ref('')
const selectedFolder = ref('')
const startDate = ref('')
const endDate = ref('')
const searchQuery = ref('')
const currentView = ref('inventory')
const currentPage = ref(1)
const pageSize = ref(20)
const historyCurrentPage = ref(1)
const historyPageSize = ref(20)
const allVms = ref([])
const isLoadingVcenters = ref(true)
const isLoadingClusters = ref(false)
const isLoadingVms = ref(false)
const isLoadingStorage = ref(false)
const errorMessage = ref('')
const historyErrorMessage = ref('')
const exportFormat = ref('csv')
const exportScope = ref('current')
const changedVmUids = ref([])
const changedNotifications = ref([])
const historyRows = ref([])
const historyStartDate = ref('')
const historyEndDate = ref('')
const isLoadingHistory = ref(false)
const storageByVm = ref({})
const ipAddressesByVm = ref({})
const vcenterListCache = ref([])
const vcenterDataCache = ref({})
const storageByVcenter = ref({})
const isSidebarCollapsed = ref(false)
const ipAddressesByVcenter = ref({})
const emit = defineEmits(['logout'])

const getVmUid = (vm) => vm?.vm_uid || vm?.vm || vm?.id || vm?.name || ''
const getVmClusterName = (vm) => {
  const clusterId = vm.cluster || vm.cluster_id || vm.clusterName || vm.cluster_name
  return vm.cluster_name || vm.cluster || clusterId || '-'
}
const getVmFolderName = (vm) => vm.folder_main || vm.folder_name || vm.folder || vm.folder_path || '-'
const getVmStorageLabel = (vm) => {
  const vmUid = getVmUid(vm)
  const storage = storageByVm.value[vmUid]
  if (storage !== undefined && storage !== null) return storage
  if (vm.storage_gb != null) return vm.storage_gb
  if (vm.storage != null) return vm.storage
  if (vm.storageGb != null) return vm.storageGb
  return '-'
}
const getVmRAMLabel = (vm) => {
  const value = vm.memory_size_MiB ?? vm.memory?.size_MiB
  if (value == null || value === '') return '-'
  return `${(Number(value) / 1024).toFixed(1)} GB`
}
const getVmIpAddresses = (vm) => {
  const vmUid = getVmUid(vm)
  return ipAddressesByVm.value[vmUid] || []
}

const getVcenterCacheKey = (vcenterId) => String(vcenterId || 'default')

const getCachedVcenterData = (vcenterId) => vcenterDataCache.value[getVcenterCacheKey(vcenterId)] || null

const setCachedVcenterData = (vcenterId, payload) => {
  vcenterDataCache.value = {
    ...vcenterDataCache.value,
    [getVcenterCacheKey(vcenterId)]: payload,
  }
}

const getCachedStorage = (vcenterId) => storageByVcenter.value[getVcenterCacheKey(vcenterId)] || {}

const getCachedIpAddresses = (vcenterId) => ipAddressesByVcenter.value[getVcenterCacheKey(vcenterId)] || {}

const setCachedStorage = (vcenterId, payload) => {
  const key = getVcenterCacheKey(vcenterId)
  const merged = {
    ...(storageByVcenter.value[key] || {}),
    ...payload,
  }

  storageByVcenter.value = {
    ...storageByVcenter.value,
    [key]: merged,
  }

  if (selectedVcenter.value && getVcenterCacheKey(selectedVcenter.value.id) === key) {
    storageByVm.value = merged
  }
}

const setCachedIpAddresses = (vcenterId, payload) => {
  const key = getVcenterCacheKey(vcenterId)
  const merged = {
    ...(ipAddressesByVcenter.value[key] || {}),
    ...payload,
  }

  ipAddressesByVcenter.value = {
    ...ipAddressesByVcenter.value,
    [key]: merged,
  }

  if (selectedVcenter.value && getVcenterCacheKey(selectedVcenter.value.id) === key) {
    ipAddressesByVm.value = merged
  }
}

const getCachedVcenterChanges = (vcenterId) => {
  const cached = getCachedVcenterData(vcenterId)
  return (cached && cached.changedNotifications) ? cached.changedNotifications : []
}

function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value !== 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const [datePart, timePart = '00:00:00'] = value.split(' ')
  const [day, month, year] = datePart.split('/')
  if (day && month && year) {
    const parsed = new Date(`${year}-${month}-${day}T${timePart}`)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(value) {
  const parsed = parseDate(value)
  if (!parsed) return '-'
  return parsed.toLocaleDateString('fr-FR')
}

function matchesDateFilter(value, fromValue, toValue) {
  if (!value) return false
  const fromDate = fromValue ? parseDate(fromValue) : null
  const toDate = toValue ? parseDate(toValue) : null

  if (fromDate && toDate) {
    const start = new Date(fromDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(toDate)
    end.setHours(23, 59, 59, 999)
    return value >= start && value <= end
  }

  if (fromDate) {
    return value.toDateString() === fromDate.toDateString()
  }

  if (toDate) {
    return value.toDateString() === toDate.toDateString()
  }

  return true
}

const loadVcenters = async () => {
  isLoadingVcenters.value = true
  errorMessage.value = ''

  try {
    if (vcenterListCache.value.length) {
      vcenters.value = vcenterListCache.value
    } else {
      const list = await getVcenterList()
      vcenterListCache.value = list
      vcenters.value = list
    }

    if (vcenters.value.length > 0) {
      selectedVcenter.value = vcenters.value[0]
      await loadVcenterData()
    } else {
      selectedVcenter.value = null
      clusters.value = []
      allVms.value = []
    }
  } catch (error) {
    errorMessage.value = 'Impossible de charger la liste des vCenter.'
  } finally {
    isLoadingVcenters.value = false
  }
}

const loadVcenterData = async () => {
  if (!selectedVcenter.value) {
    clusters.value = []
    allVms.value = []
    storageByVm.value = {}
    ipAddressesByVm.value = {}
    return
  }

  const vcenterId = selectedVcenter.value.id
  const cacheKey = getVcenterCacheKey(vcenterId)
  const cachedData = getCachedVcenterData(vcenterId)

  isLoadingClusters.value = true
  isLoadingVms.value = true
  errorMessage.value = ''

  try {
    if (cachedData) {
      clusters.value = cachedData.clusters || []
      allVms.value = (cachedData.vms || []).map((vm) => ({
        ...vm,
        vmUid: getVmUid(vm),
      }))
      changedVmUids.value = cachedData.changedVmUids || []
      changedNotifications.value = cachedData.changedNotifications || []
      allVms.value = allVms.value.map((vm) => ({
        ...vm,
        hasChangesToday: changedVmUids.value.includes(getVmUid(vm)),
      }))
      storageByVm.value = getCachedStorage(vcenterId)
      ipAddressesByVm.value = getCachedIpAddresses(vcenterId)
    } else {
      const fetchedClusters = await getVcenterClusters(vcenterId)
      clusters.value = fetchedClusters

      const vms = await getAllVmsWithClusterInfo(vcenterId)
      const mappedVms = (vms || []).map((vm) => ({
        ...vm,
        vmUid: getVmUid(vm),
      }))
      allVms.value = mappedVms

      const changedUids = await getVmsChangedToday(vcenterId)
      changedVmUids.value = changedUids || []

      const changeDetails = await getVmsChangedTodayDetails(vcenterId)
      changedNotifications.value = changeDetails || []

      allVms.value = allVms.value.map((vm) => ({
        ...vm,
        hasChangesToday: changedVmUids.value.includes(getVmUid(vm)),
      }))

      setCachedVcenterData(vcenterId, {
        clusters: fetchedClusters,
        vms: mappedVms,
        changedVmUids: changedVmUids.value,
        changedNotifications: changedNotifications.value,
      })
      storageByVm.value = {}
      ipAddressesByVm.value = {}
    }

    await loadCurrentPageStorage()
    await loadCurrentPageNetworking()

    selectedCluster.value = ''
    selectedFolder.value = ''
    startDate.value = ''
    endDate.value = ''
    searchQuery.value = ''
    currentPage.value = 1
  } catch (error) {
    errorMessage.value = 'Impossible de récupérer les machines virtuelles pour ce vCenter.'
    clusters.value = []
    allVms.value = []
    storageByVm.value = {}
  } finally {
    isLoadingClusters.value = false
    isLoadingVms.value = false
  }
}

const handleVcenterChange = (id) => {
  const vcenter = vcenters.value.find((item) => item.id === id)
  if (!vcenter) return
  selectedVcenter.value = vcenter
  currentPage.value = 1
  loadVcenterData()
}

const handleClusterChange = (value) => {
  selectedCluster.value = value
  currentPage.value = 1
}

const handleFolderChange = (value) => {
  selectedFolder.value = value
  currentPage.value = 1
}

const handleStartDateChange = (value) => {
  startDate.value = value
  currentPage.value = 1
}

const handleEndDateChange = (value) => {
  endDate.value = value
  currentPage.value = 1
}

const handleSearch = (value) => {
  searchQuery.value = value
  currentPage.value = 1
  historyCurrentPage.value = 1
}

const resetFilters = () => {
  selectedCluster.value = ''
  selectedFolder.value = ''
  startDate.value = ''
  endDate.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  historyCurrentPage.value = 1
}

const historyCache = ref({})

const getHistoryCacheKey = (vcenterId, startDate, endDate, query) => `${getVcenterCacheKey(vcenterId)}::${startDate || ''}::${endDate || ''}::${query || ''}`

const folderOptions = computed(() => {
  const folders = new Set()
  for (const vm of allVms.value) {
    const folder = getVmFolderName(vm)
    if (folder && folder !== '-') {
      folders.add(folder)
    }
  }
  return Array.from(folders).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
})

const filteredVms = computed(() => {
  let rows = [...allVms.value]

  if (selectedCluster.value) {
    rows = rows.filter((vm) => {
      const clusterValue = vm.cluster || vm.cluster_id || vm.cluster_name || ''
      return String(clusterValue) === String(selectedCluster.value)
    })
  }

  if (selectedFolder.value) {
    rows = rows.filter((vm) => getVmFolderName(vm) === selectedFolder.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    rows = rows.filter((vm) => {
      const haystack = [
        vm.name,
        vm.os,
        getVmClusterName(vm),
        getVmFolderName(vm),
        vm.vm_uid,
        ...getVmIpAddresses(vm),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }

  if (startDate.value || endDate.value) {
    rows = rows.filter((vm) => {
      const vmDate = parseDate(vm.creation_date || vm.create_time || vm.creation_time || vm.identity?.create_time)
      return matchesDateFilter(vmDate, startDate.value, endDate.value)
    })
  }

  return rows
})

const filteredHistoryRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return historyRows.value.filter((row) => {
    const rowDate = parseDate(row.change_date)
    const matchesDate = matchesDateFilter(rowDate, historyStartDate.value, historyEndDate.value)
    const haystack = [row.vm_name, row.vm_uid, row.libelle, row.old_value, row.new_value]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query || haystack.includes(query)
    return matchesDate && matchesQuery
  })
})

const historyTotalPages = computed(() => Math.max(1, Math.ceil(filteredHistoryRows.value.length / historyPageSize.value)))
const paginatedHistoryRows = computed(() => {
  const start = (historyCurrentPage.value - 1) * historyPageSize.value
  return filteredHistoryRows.value.slice(start, start + historyPageSize.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredVms.value.length / pageSize.value)))
const paginatedVms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredVms.value.slice(start, start + pageSize.value)
})

const currentPageVmIds = computed(() => paginatedVms.value.map((vm) => getVmUid(vm)).filter(Boolean))

const paginatedVmsWithStorage = computed(() => {
  return paginatedVms.value.map((vm) => {
    const vmUid = getVmUid(vm)
    const storage = storageByVm.value[vmUid]
    const ipAddresses = ipAddressesByVm.value[vmUid]

    return {
      ...vm,
      ...(storage !== undefined && storage !== null ? { storage_gb: storage } : {}),
      ipAddresses: Array.isArray(ipAddresses) ? ipAddresses : [],
    }
  })
})

const loadCurrentPageStorage = async () => {
  if (!selectedVcenter.value || currentPageVmIds.value.length === 0) {
    return
  }

  const vcenterId = selectedVcenter.value.id
  const currentStorage = getCachedStorage(vcenterId)
  const missingVmIds = currentPageVmIds.value.filter((vmId) => currentStorage[vmId] === undefined)

  if (missingVmIds.length === 0) {
    storageByVm.value = currentStorage
    return
  }

  isLoadingStorage.value = true
  try {
    const storageMap = await getVmStorageBatch(missingVmIds, vcenterId)
    setCachedStorage(vcenterId, storageMap)
    storageByVm.value = getCachedStorage(vcenterId)
  } catch (error) {
    console.warn('Impossible de charger le stockage des VMs de la page', error)
  } finally {
    isLoadingStorage.value = false
  }
}

const loadCurrentPageNetworking = async () => {
  if (!selectedVcenter.value || currentPageVmIds.value.length === 0) {
    return
  }

  const vcenterId = selectedVcenter.value.id
  const currentIpAddresses = getCachedIpAddresses(vcenterId)
  const missingVmIds = currentPageVmIds.value.filter((vmId) => currentIpAddresses[vmId] === undefined)

  if (missingVmIds.length === 0) {
    ipAddressesByVm.value = currentIpAddresses
    return
  }

  try {
    const ipAddressesMap = {}
    await Promise.all(missingVmIds.map(async (vmId) => {
      try {
        const interfaces = await getVmGuestNetworkingInterfaces(vmId, vcenterId)
        ipAddressesMap[vmId] = extractIpAddresses(interfaces)
      } catch (error) {
        ipAddressesMap[vmId] = []
      }
    }))

    setCachedIpAddresses(vcenterId, ipAddressesMap)
    ipAddressesByVm.value = getCachedIpAddresses(vcenterId)
  } catch (error) {
    console.warn('Impossible de charger les IPs des VMs de la page', error)
  }
}

watch(currentPageVmIds, () => {
  loadCurrentPageStorage()
  loadCurrentPageNetworking()
})

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
})

watch(historyTotalPages, (value) => {
  if (historyCurrentPage.value > value) {
    historyCurrentPage.value = value
  }
})

const loadHistoryData = async () => {
  if (!selectedVcenter.value) {
    historyRows.value = []
    return
  }

  const vcenterId = selectedVcenter.value.id
  const cacheKey = getHistoryCacheKey(vcenterId, historyStartDate.value, historyEndDate.value, searchQuery.value)
  const cached = historyCache.value[cacheKey]
  if (cached) {
    historyRows.value = cached
    return
  }

  isLoadingHistory.value = true
  historyErrorMessage.value = ''

  try {
    const rows = await getVmHistoryEntries(vcenterId, {
      startDate: historyStartDate.value,
      endDate: historyEndDate.value,
      searchQuery: searchQuery.value,
    })
    historyRows.value = rows
    historyCache.value = {
      ...historyCache.value,
      [cacheKey]: rows,
    }
  } catch (error) {
    historyErrorMessage.value = 'Impossible de charger l\u2019historique.'
    historyRows.value = []
  } finally {
    isLoadingHistory.value = false
  }
}

watch(currentView, (value) => {
  if (value === 'history') {
    loadHistoryData()
  }
})

watch([selectedVcenter, historyStartDate, historyEndDate, searchQuery], () => {
  historyCurrentPage.value = 1
  if (currentView.value === 'history') {
    loadHistoryData()
  }
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleViewChange = (view) => {
  currentView.value = view
  historyCurrentPage.value = 1
}

const handleHistoryStartDateChange = (value) => {
  historyStartDate.value = value
  historyCurrentPage.value = 1
}

const handleHistoryEndDateChange = (value) => {
  historyEndDate.value = value
  historyCurrentPage.value = 1
}

const handleHistoryPageChange = (page) => {
  historyCurrentPage.value = page
}

const buildExportRows = (rows) => rows.map((vm) => [
  vm.name || '-',
  vm.os || '-',
  vm.cpu_count ?? vm.cpu?.count ?? '-',
  getVmRAMLabel(vm),
  getVmStorageLabel(vm),
  formatDate(vm.creation_date || vm.create_time || vm.creation_time || vm.identity?.create_time),
  getVmClusterName(vm),
  getVmFolderName(vm),
])

const downloadExport = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportData = () => {
  const rows = exportScope.value === 'current' ? paginatedVms.value : filteredVms.value
  if (!rows.length) return

  const headers = ['Nom', 'OS', 'CPU', 'RAM (GB)', 'Stockage (GB)', 'Date de création', 'Cluster', 'Dossier']
  const data = buildExportRows(rows)
  const lineBreak = '\r\n'

  if (exportFormat.value === 'excel') {
    const htmlRows = data.map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table><thead><tr>${headers.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`
    downloadExport(html, `vms_export_${new Date().toISOString().slice(0, 10)}.xls`, 'application/vnd.ms-excel;charset=utf-8;')
    return
  }

  const csvLines = [headers.join(';'), ...data.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))]
  downloadExport(csvLines.join(lineBreak), `vms_export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;')
}

const handleLogout = () => {
  logoutApi()
  emit('logout')
  selectedVcenter.value = null
  vcenters.value = []
  clusters.value = []
  allVms.value = []
  storageByVm.value = {}
  ipAddressesByVm.value = {}
  vcenterListCache.value = []
  vcenterDataCache.value = {}
  storageByVcenter.value = {}
  ipAddressesByVcenter.value = {}
  historyRows.value = []
  historyCache.value = {}
  currentPage.value = 1
  currentView.value = 'inventory'
  errorMessage.value = ''
  historyErrorMessage.value = ''
}

onMounted(() => {
  loadVcenters()
})
</script>

<template>
  <div class="dashboard">
    <Sidebar
      :vcenters="vcenters"
      :selectedVcenter="selectedVcenter"
      :clusters="clusters"
      :folders="folderOptions"
      :cluster="selectedCluster"
      :folder="selectedFolder"
      :startDate="startDate"
      :endDate="endDate"
      :currentView="currentView"
      :collapsed="isSidebarCollapsed"
      @update:collapsed="isSidebarCollapsed = $event"
      @selectVcenter="handleVcenterChange"
      @update:cluster="handleClusterChange"
      @update:folder="handleFolderChange"
      @update:startDate="handleStartDateChange"
      @update:endDate="handleEndDateChange"
      @resetFilters="resetFilters"
      @changeView="handleViewChange"
    />
    <div :class="['main-content', { expanded: isSidebarCollapsed }]">
      <TopBar
        :searchQuery="searchQuery"
        :notifications="changedNotifications"
        @update:searchQuery="handleSearch"
        @logout="handleLogout"
      />
      <div class="content-area">
        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
        <div v-if="currentView === 'inventory'">
          <ExportBar
            :exportFormat="exportFormat"
            :exportScope="exportScope"
            :disabled="!filteredVms.length"
            @update:exportFormat="(value) => (exportFormat = value)"
            @update:exportScope="(value) => (exportScope = value)"
            @export="exportData"
          />
          <VmTable
            :rows="paginatedVmsWithStorage"
            :loading="isLoadingVms"
            :emptyMessage="selectedVcenter ? 'Aucune machine virtuelle trouvée.' : 'Sélectionnez un vCenter pour afficher les VMs.'"
          />
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            @changePage="handlePageChange"
          />
        </div>

        <div v-else class="history-view">
          <div class="history-panel">
            <div class="history-header">
              <div>
                <h3>Historique des modifications</h3>
                <p>Consultez les changements enregistrés pour chaque machine virtuelle.</p>
              </div>
              <div class="history-summary">{{ filteredHistoryRows.length }} élément(s)</div>
            </div>

            <div class="history-toolbar">
              <div class="history-filter-group">
                <label class="history-filter-label">Filtrer par date</label>
                <div class="history-date-inputs">
                  <label class="history-date-field">
                    <span>Du</span>
                    <input type="date" :value="historyStartDate" @input="handleHistoryStartDateChange($event.target.value)" />
                  </label>
                  <label class="history-date-field">
                    <span>Au</span>
                    <input type="date" :value="historyEndDate" @input="handleHistoryEndDateChange($event.target.value)" />
                  </label>
                </div>
              </div>
            </div>

            <div v-if="historyErrorMessage" class="error-banner">{{ historyErrorMessage }}</div>

            <div v-if="isLoadingHistory" class="panel-empty">Chargement de l'historique…</div>
            <div v-else-if="filteredHistoryRows.length === 0" class="panel-empty">Aucune modification trouvée pour ce vCenter.</div>
            <div v-else class="history-table-wrapper">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>VM</th>
                    <th>Modification</th>
                    <th>Ancienne valeur</th>
                    <th>Nouvelle valeur</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in paginatedHistoryRows" :key="`${row.vm_uid}-${row.change_date}-${index}`">
                    <td>
                      <div class="history-cell-main">{{ row.vm_name || row.vm_uid }}</div>
                    </td>
                    <td>
                      <div class="history-cell-main">{{ row.libelle || '-' }}</div>
                    </td>
                    <td>
                      <div class="history-cell-value">{{ row.old_value ?? '-' }}</div>
                    </td>
                    <td>
                      <div class="history-cell-value">{{ row.new_value ?? '-' }}</div>
                    </td>
                    <td>
                      <div class="history-cell-muted">{{ formatDate(row.change_date) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Pagination
              :currentPage="historyCurrentPage"
              :totalPages="historyTotalPages"
              @changePage="handleHistoryPageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 0;
}

.content-area {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-banner {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.08);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.15);
  font-size: 14px;
}

.history-view {
  display: flex;
  flex-direction: column;
}

.history-panel {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.history-header h3 {
  font-size: 18px;
  color: var(--neutral-800);
  margin-bottom: 4px;
}

.history-header p {
  font-size: 13px;
  status: var(--neutral-500);
}

.history-summary {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.08);
  color: var(--primary-dark);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.history-toolbar {
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.history-filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-filter-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--neutral-600);
  text-transform: uppercase;
}

.history-date-inputs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.history-date-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  min-width: 220px;
}

.history-date-field span {
  font-size: 13px;
  color: var(--neutral-500);
  font-weight: 600;
}

.history-date-field input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--neutral-800);
  font-size: 14px;
}

.history-date-field input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.4);
}

.panel-empty {
  padding: 24px;
  text-align: center;
  color: var(--neutral-500);
  background: var(--neutral-50);
  border: 1px dashed var(--neutral-300);
  border-radius: var(--radius-md);
}

.history-table-wrapper {
  overflow: auto;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
}

.history-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 14px;
}

.history-table th {
  background: var(--neutral-50);
  padding: 12px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--neutral-600);
  border-bottom: 1px solid var(--neutral-200);
}

.history-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--neutral-100);
  color: var(--neutral-700);
  vertical-align: top;
}

.history-table tbody tr:nth-child(even) {
  background: rgba(248, 250, 252, 0.6);
}

.history-table tbody tr:hover {
  background: rgba(14, 165, 233, 0.04);
}

.history-cell-main {
  font-weight: 600;
  color: var(--neutral-800);
}

.history-cell-value {
  font-weight: 600;
  color: var(--neutral-800);
}

.history-cell-muted {
  color: var(--neutral-500);
}

@media (max-width: 900px) {
  .history-header {
    flex-direction: column;
  }

  .history-summary {
    align-self: flex-start;
  }
}
</style>
