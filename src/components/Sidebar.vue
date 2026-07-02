<script setup>
const props = defineProps({
  vcenters: Array,
  selectedVcenter: [String, Object],
  clusters: Array,
  folders: Array,
  cluster: String,
  folder: String,
  startDate: String,
  endDate: String,
  currentView: String,
  collapsed: Boolean
})

const emit = defineEmits([
  'selectVcenter',
  'update:cluster',
  'update:folder',
  'update:startDate',
  'update:endDate',
  'update:collapsed',
  'resetFilters',
  'changeView'
])

const resetFilters = () => {
  emit('update:cluster', '')
  emit('update:folder', '')
  emit('update:startDate', '')
  emit('update:endDate', '')
  emit('resetFilters')
}

const getClusterValue = (cluster) => {
  if (typeof cluster === 'string') return cluster
  return cluster?.id || cluster?.cluster || cluster?.name || ''
}

const getClusterLabel = (cluster) => {
  if (typeof cluster === 'string') return cluster
  return cluster?.name || cluster?.cluster || cluster?.id || ''
}
</script>

<template>
  <!-- SIDEBAR -->
  <aside
    v-if="!collapsed"
    class="sidebar"
  >
    <div class="sidebar-header">
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>

        <span class="logo-text">vCenter Monitor</span>
      </div>

      <!-- Fermer complètement -->
      <button
        class="toggle-btn"
        @click="emit('update:collapsed', true)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">

      <div class="nav-section">
        <span class="section-label">Environnements</span>

        <div class="vcenter-buttons">
          <button
            v-for="vc in vcenters"
            :key="vc.id"
            :class="[
              'vcenter-btn',
              {
                active:
                  selectedVcenter?.id === vc.id ||
                  selectedVcenter === vc.id
              }
            ]"
            @click="emit('selectVcenter', vc.id)"
          >
            <svg
              class="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
            </svg>

            <span class="btn-text">
              {{ vc.name }}
            </span>

            <span class="status-dot online"></span>
          </button>
        </div>
      </div>

      <div class="nav-section">
        <span class="section-label">Navigation</span>

        <button
          class="nav-action-btn"
          :class="{ active: currentView === 'inventory' }"
          @click="emit('changeView', 'inventory')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h10" />
            <path d="M7 12h10" />
            <path d="M7 16h6" />
          </svg>

          <span>Inventaire</span>
        </button>

        <button
          class="nav-action-btn"
          :class="{ active: currentView === 'history' }"
          @click="emit('changeView', 'history')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>

          <span>Historique</span>
        </button>
      </div>

      <div
        v-if="currentView === 'inventory'"
        class="nav-section filters-section"
      >
        <span class="section-label">Filtres</span>

        <div class="filter-group">
          <label>Cluster</label>

          <div class="select-wrapper">
            <select
              :value="cluster"
              @change="emit('update:cluster', $event.target.value)"
            >
              <option value="">
                Tous les clusters
              </option>

              <option
                v-for="c in clusters"
                :key="getClusterValue(c)"
                :value="getClusterValue(c)"
              >
                {{ getClusterLabel(c) }}
              </option>
            </select>

            <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div class="filter-group">
          <label>Dossier</label>

          <div class="select-wrapper">
            <select
              :value="folder"
              @change="emit('update:folder', $event.target.value)"
            >
              <option value="">
                Tous les dossiers
              </option>

              <option
                v-for="f in folders"
                :key="f"
                :value="f"
              >
                {{ f }}
              </option>
            </select>

            <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div class="filter-group">
          <label>Période</label>

          <div class="date-inputs">
            <input
              type="date"
              :value="startDate"
              @input="emit('update:startDate', $event.target.value)"
            />

            <span class="date-separator">
              à
            </span>

            <input
              type="date"
              :value="endDate"
              @input="emit('update:endDate', $event.target.value)"
            />
          </div>
        </div>

        <button
          class="reset-btn"
          @click="resetFilters"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>

          Réinitialiser
        </button>
      </div>

    </nav>

    <div class="sidebar-footer">
      <div class="status-bar">
        <span class="status-indicator online"></span>
        <span class="status-text">Connexion active</span>
      </div>
    </div>
  </aside>

  <!-- Bouton flottant pour rouvrir -->
  <button
    v-if="collapsed"
    class="reopen-btn"
    @click="emit('update:collapsed', false)"
    aria-label="Ouvrir le menu"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>

</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--neutral-900);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--neutral-700);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--neutral-100);
  white-space: nowrap;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--neutral-400);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: var(--neutral-200);
}

.toggle-btn svg {
  width: 18px;
  height: 18px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--neutral-500);
  margin-bottom: 12px;
  padding-left: 8px;
}

.vcenter-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vcenter-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: var(--neutral-800);
  border: 1px solid var(--neutral-700);
  border-radius: var(--radius-md);
  color: var(--neutral-300);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.vcenter-btn:hover {
  background: var(--neutral-700);
  border-color: var(--neutral-600);
  color: var(--neutral-100);
}

.vcenter-btn.active {
  background: rgba(14, 165, 233, 0.15);
  border-color: var(--primary);
  color: var(--primary-light);
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: var(--success);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.status-dot.offline {
  background: var(--error);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

.nav-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  margin-bottom: 8px;
  background: var(--neutral-800);
  border: 1px solid var(--neutral-700);
  border-radius: var(--radius-md);
  color: var(--neutral-300);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-action-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.nav-action-btn svg {
  width: 16px;
  height: 16px;
}

.filters-section {
  padding: 16px;
  background: var(--neutral-800);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-700);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  color: var(--neutral-400);
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
  width: 100%;
  padding: 8px 28px 8px 10px;
  border: 1px solid var(--neutral-600);
  border-radius: var(--radius-md);
  background: var(--neutral-700);
  font-size: 13px;
  color: var(--neutral-200);
  cursor: pointer;
  transition: all 0.2s;
}

.select-wrapper select:focus {
  outline: none;
  border-color: var(--primary);
}

.select-wrapper select option {
  background: var(--neutral-800);
  color: var(--neutral-200);
}

.select-arrow {
  position: absolute;
  right: 8px;
  width: 12px;
  height: 12px;
  color: var(--neutral-400);
  pointer-events: none;
}

.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-inputs input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--neutral-600);
  border-radius: var(--radius-md);
  background: var(--neutral-700);
  font-size: 13px;
  color: var(--neutral-200);
  transition: all 0.2s;
}

.date-inputs input:focus {
  outline: none;
  border-color: var(--primary);
}

.date-separator {
  font-size: 11px;
  color: var(--neutral-500);
  text-align: center;
  font-weight: 500;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  margin-top: 4px;
  background: transparent;
  color: var(--neutral-400);
  border: 1px solid var(--neutral-600);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: var(--neutral-700);
  color: var(--neutral-200);
  border-color: var(--neutral-500);
}

.reset-btn svg {
  width: 13px;
  height: 13px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--neutral-700);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 12px;
  color: var(--neutral-400);
}

.reopen-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all 0.2s;
}

.reopen-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.reopen-btn svg {
  width: 20px;
  height: 20px;
}
</style>
