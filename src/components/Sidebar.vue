<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  vcenters: { id: string; name: string }[]
  selectedVcenter: string
}>()

const emit = defineEmits<{
  (e: 'selectVcenter', id: string): void
}>()

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
        <span v-if="!isCollapsed" class="logo-text">vCenter Monitor</span>
      </div>
      <button class="toggle-btn" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <span v-if="!isCollapsed" class="section-label">Environnements</span>
        <div class="vcenter-buttons">
          <button
            v-for="vc in vcenters"
            :key="vc.id"
            :class="['vcenter-btn', { active: selectedVcenter === vc.id }]"
            @click="emit('selectVcenter', vc.id)"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
            </svg>
            <span v-if="!isCollapsed" class="btn-text">{{ vc.name }}</span>
            <span v-if="!isCollapsed" class="status-dot" :class="vc.id === 'vcenter1' ? 'online' : 'offline'"></span>
          </button>
        </div>
      </div>

      <div class="nav-section">
        <span v-if="!isCollapsed" class="section-label">Navigation</span>
        <a href="#" class="nav-link active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span v-if="!isCollapsed">Dashboard</span>
        </a>
        <a href="#" class="nav-link">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <span v-if="!isCollapsed">Inventaire</span>
        </a>
        <a href="#" class="nav-link">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20v-6M6 20V10M18 20V4" />
          </svg>
          <span v-if="!isCollapsed">Métriques</span>
        </a>
        <a href="#" class="nav-link">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span v-if="!isCollapsed">Historique</span>
        </a>
      </div>
    </nav>

    <div v-if="!isCollapsed" class="sidebar-footer">
      <div class="status-bar">
        <span class="status-indicator online"></span>
        <span class="status-text">Connexion active</span>
      </div>
    </div>
  </aside>
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
  transition: width 0.3s ease;
  z-index: 100;
}

.sidebar.collapsed {
  width: 72px;
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

.sidebar.collapsed .toggle-btn svg {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 28px;
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

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: var(--neutral-400);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  margin-bottom: 4px;
}

.nav-link:hover {
  background: var(--neutral-800);
  color: var(--neutral-200);
}

.nav-link.active {
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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
</style>
