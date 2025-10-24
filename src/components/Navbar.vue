<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-2">
    <div class="container-fluid px-4">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img src="@/assets/logo.png" alt="Logo" height="32" class="me-2" />
        <span class="fw-bold fs-5 text-primary">Elitech ERP</span>
      </router-link>

      <!-- Toggle untuk Mobile -->
      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <i class="bi bi-list fs-3 text-primary"></i>
      </button>

      <!-- Menu Kanan -->
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav align-items-center">
          <li v-if="auth.user" class="nav-item d-flex align-items-center me-3 text-dark fw-semibold">
            <i class="bi bi-person-circle me-2 fs-5 text-primary"></i>
            <span>Halo, {{ auth.user.name }}</span>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-primary rounded-pill px-3" @click="logout">
              <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/authStore'

export default {
  name: 'AppNavbar',
  setup() {
    const auth = useAuthStore()
    const logout = () => auth.logout()
    return { auth, logout }
  }
}
</script>

<style scoped>
.navbar {
  transition: box-shadow 0.3s ease;
}

.navbar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
