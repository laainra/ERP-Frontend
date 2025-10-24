<template>
  <aside
    :class="[
      'sidebar d-flex flex-column justify-between shadow',
      isMinimized ? 'sidebar-minimized' : 'sidebar-expanded'
    ]"
  >
    <!-- Header Sidebar -->
    <div class="sidebar-header text-center py-4 border-bottom">
      <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo mb-2" />
      <h6 v-if="!isMinimized" class="fw-bold text-white m-0">Elitech ERP</h6>
    </div>

    <!-- Menu List -->
    <ul class="nav flex-column mt-3 flex-grow-1">
      <li v-for="item in filteredMenu" :key="item.path">
        <router-link
          :to="item.path"
          class="nav-link d-flex align-items-center px-3 py-2"
          :class="isActive(item.path) ? 'active-link' : ''"
        >
          <i :class="[item.icon, 'me-2 fs-5']"></i>
          <span v-if="!isMinimized">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    <!-- User Info + Logout -->
    <div class="sidebar-footer border-top py-3 px-3">
      <div v-if="!isMinimized" class="d-flex align-items-center mb-3">
        <i class="bi bi-person-circle fs-4 me-2 text-light"></i>
        <div class="text-truncate">
          <div class="fw-semibold text-white small">{{ user?.name || 'User' }}</div>
          <div class=" text-white small">{{ user?.role || '-' }}</div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <button 
          @click="handleLogout" 
          type="button"
          class="btn btn-link text-light text-decoration-none d-flex align-items-center p-0"
        >
          <i class="bi bi-box-arrow-right me-2"></i>
          <span v-if="!isMinimized">Logout</span>
        </button>

        <button class="btn btn-sm btn-outline-light" @click="toggleSidebar">
          <i :class="isMinimized ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "AppSidebar",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const auth = useAuthStore();

    const role = route.path.startsWith("/ppic")
      ? "ppic"
      : route.path.startsWith("/production")
      ? "production"
      : "unknown";

    const menu = [
      {
        role: "ppic",
        items: [
          { path: "/ppic", label: "Dashboard", icon: "bi bi-speedometer2" },
          { path: "/ppic/products", label: "Daftar Produk", icon: "bi bi-box-seam" },
          { path: "/ppic/plans", label: "Rencana Produksi", icon: "bi bi-list-check" },
          { path: "/production/logs", label: "Log Produksi", icon: "bi bi-journal-text" }
        ],
      },
      {
        role: "production",
        items: [
          { path: "/production", label: "Dashboard", icon: "bi bi-speedometer2" },
          { path: "/production/orders", label: "Order Produksi", icon: "bi bi-box" },
          { path: "/production/reports", label: "Laporan Produksi", icon: "bi bi-file-earmark-text" },
          { path: "/production/logs", label: "Log Produksi", icon: "bi bi-journal-text" },
        ],
      },
    ];

    const handleLogout = () => {
      auth.$reset();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    };

    const filteredMenu = menu.find((m) => m.role === role)?.items || [];
    const isActive = (path) => route.path === path;

    return { filteredMenu, isActive, handleLogout, user: auth.user };
  },
  data() {
    return { isMinimized: false };
  },
  methods: {
    toggleSidebar() {
      this.isMinimized = !this.isMinimized;
    },
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #1e2f4d;
  color: #fff;
  transition: all 0.3s ease;
  height: 100vh;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.sidebar-expanded {
  min-width: 230px;
  max-width: 230px;
}

.sidebar-minimized {
  width: 90px;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #18273f;
}

.sidebar-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.nav-link {
  color: #dee2e6;
  border-radius: 8px;
  margin: 4px 8px;
  transition: 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.active-link {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 600;
}

.sidebar-footer {
  background: #18273f;
}

.btn-outline-light {
  border: none;
  color: #dee2e6;
}
.btn-outline-light:hover {
  color: #fff;
}
</style>
