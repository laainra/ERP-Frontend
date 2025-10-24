<template>
  <div :class="`theme-${theme}`" class="d-flex flex-column vh-100">
    <!-- Navbar -->
    <AppNavbar />

    <div class="d-flex flex-fill">
      <!-- Sidebar -->
      <AppSidebar :role="'produksi'" />

      <!-- Content utama -->
      <main class="flex-fill p-4 bg-light">
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
import { useThemeStore } from '../stores/themeStore'

export default {
  name: "ProductionLayout",
  components: { AppNavbar, AppSidebar, AppFooter },
  setup() {
    const themeStore = useThemeStore()
    return { theme: themeStore.theme }
  }
}
</script>

<style scoped>
main {
  min-height: calc(100vh - 120px); /* navbar + footer */
}
</style>
