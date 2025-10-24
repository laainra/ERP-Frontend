<template>
  <div class="d-flex vh-100">
    <AppSidebar />

    <!-- Konten utama -->
    <main
      class="flex-fill p-4 content-area"
      :class="isMinimized ? 'content-collapsed' : ''"
    >
      <div class="content-inner">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from '@/components/Sidebar.vue'
import { useSidebarStore } from '@/stores/sidebarStore'
import { computed } from 'vue'

export default {
  name: 'MainLayout',
  components: { AppSidebar },
  setup() {
    const sidebarStore = useSidebarStore()
    const isMinimized = computed(() => sidebarStore.isMinimized)
    return { isMinimized }
  }
}
</script>

<style scoped>
.content-area {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  margin: 1rem;
  padding: 2rem;
  overflow: auto;
  transition: margin-left 0.3s ease;
}

/* Lebar konten otomatis menyesuaikan sidebar */
.content-collapsed {
  margin-left: 70px; /* sama dengan sidebar-minimized */
}

.content-inner {
  min-width: 800px;
}
</style>
