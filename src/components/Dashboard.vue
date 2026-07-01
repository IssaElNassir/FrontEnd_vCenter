<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import VmTable from './VmTable.vue'
import Pagination from './Pagination.vue'
import ExportBar from './ExportBar.vue'

const selectedVcenter = ref('vcenter1')
const selectedCluster = ref('')
const selectedFolder = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const totalPages = ref(15)

const vcenters = [
  { id: 'vcenter1', name: 'vCenter Production' },
  { id: 'vcenter2', name: 'vCenter Test' }
]

const clusters = ['Cluster-A', 'Cluster-B', 'Cluster-C', 'Cluster-D']
const folders = ['Production', 'Test', 'Development', 'Staging', 'Archive']

const handleVcenterChange = (id) => {
  selectedVcenter.value = id
}

const handlePageChange = (page) => {
  currentPage.value = page
}
</script>

<template>
  <div class="dashboard">
    <Sidebar
      :vcenters="vcenters"
      :selectedVcenter="selectedVcenter"
      :clusters="clusters"
      :folders="folders"
      v-model:cluster="selectedCluster"
      v-model:folder="selectedFolder"
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      @selectVcenter="handleVcenterChange"
    />
    <div class="main-content">
      <TopBar />
      <div class="content-area">
        <ExportBar />
        <VmTable :selectedVcenter="selectedVcenter" />
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @changePage="handlePageChange"
        />
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
}

.content-area {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
