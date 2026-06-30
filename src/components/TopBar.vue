<script setup lang="ts">
import { ref } from 'vue'

const showLogoutConfirm = ref(false)

const handleLogout = () => {
  showLogoutConfirm.value = false
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <h1 class="page-title">Supervision vCenter</h1>
      <span class="breadcrumb">Dashboard / Inventaire VM</span>
    </div>
    <div class="top-bar-right">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Rechercher une VM..." />
      </div>
      <button class="notif-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span class="notif-badge">3</span>
      </button>
      <div class="user-menu">
        <button class="logout-btn" @click="showLogoutConfirm = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>

    <div v-if="showLogoutConfirm" class="logout-modal-overlay" @click="showLogoutConfirm = false">
      <div class="logout-modal" @click.stop>
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h3>Confirmer la déconnexion</h3>
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showLogoutConfirm = false">Annuler</button>
          <button class="btn-primary" @click="handleLogout">Déconnexion</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  height: var(--header-height);
  background: var(--neutral-50);
  border-bottom: 1px solid var(--neutral-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--neutral-800);
}

.breadcrumb {
  font-size: 13px;
  color: var(--neutral-500);
  padding-left: 12px;
  border-left: 1px solid var(--neutral-300);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 260px;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  background: white;
  font-size: 14px;
  color: var(--neutral-700);
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.search-box input::placeholder {
  color: var(--neutral-400);
}

.search-icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  color: var(--neutral-400);
}

.notif-btn {
  position: relative;
  background: none;
  border: none;
  padding: 8px;
  color: var(--neutral-500);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-btn:hover {
  background: var(--neutral-200);
  color: var(--neutral-700);
}

.notif-btn svg {
  width: 20px;
  height: 20px;
}

.notif-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu {
  display: flex;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--error);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.logout-btn svg {
  width: 16px;
  height: 16px;
}

.logout-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.logout-modal {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 380px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-icon {
  width: 56px;
  height: 56px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--error);
}

.modal-icon svg {
  width: 28px;
  height: 28px;
}

.logout-modal h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--neutral-800);
  margin-bottom: 8px;
}

.logout-modal p {
  font-size: 14px;
  color: var(--neutral-500);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-secondary {
  padding: 10px 20px;
  background: var(--neutral-100);
  color: var(--neutral-700);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--neutral-200);
}

.btn-primary {
  padding: 10px 20px;
  background: var(--error);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #dc2626;
}
</style>
