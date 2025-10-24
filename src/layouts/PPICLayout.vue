<template>
  <div class="d-flex flex-column vh-100 bg-light">
    <!-- Navbar -->
    <AppNavbar />

    <div class="d-flex flex-grow-1 overflow-hidden">
      <!-- Sidebar -->
      <AppSidebar :role="'ppic'" />

      <!-- Content -->
      <main class="flex-fill p-4 overflow-auto">
        <slot></slot>
      </main>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '../components/Navbar.vue'
import AppSidebar from '../components/Sidebar.vue'
import AppFooter from '../components/Footer.vue'

export default {
  name: "PPICLayout",
  components: { AppNavbar, AppSidebar, AppFooter }
}
</script>

<style scoped>
main {
  min-height: calc(100vh - 120px); /* offset navbar + footer */
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
}
</style>
