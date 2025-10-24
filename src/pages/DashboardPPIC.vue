<template>
  <MainLayout>
    <div class="dashboard-wrapper p-5">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 class="dashboard-title mb-1">Dashboard PPIC</h1>
          <p class="dashboard-subtitle mb-0">Kelola dan pantau aktivitas produksi dengan mudah</p>
        </div>
        <i class="bi bi-speedometer2 fs-1 text-primary"></i>
      </div>

      <!-- Dashboard Cards -->
      <div class="dashboard-cards-grid">
        <!-- Rencana Produksi -->
        <div class="dashboard-card card hover-card">
          <div class="card-body d-flex align-items-center">
            <div class="icon-circle bg-primary-subtle text-primary me-3">
              <i class="bi bi-journal-text fs-3"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-semibold mb-1">Rencana Produksi</h5>
              <p class="text-muted small mb-3">Buat dan kelola rencana produksi</p>
              <router-link to="/ppic/plans" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                <i class="bi bi-box-arrow-in-right me-1"></i> Buka
              </router-link>
            </div>
          </div>
        </div>


        <!-- Daftar Produk -->
        <div class="dashboard-card card hover-card">
          <div class="card-body d-flex align-items-center">
            <div class="icon-circle bg-info-subtle text-info me-3">
              <i class="bi bi-box-seam fs-3"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-semibold mb-1">Daftar Produk</h5>
              <p class="text-muted small mb-3">Lihat dan kelola produk yang tersedia</p>
              <router-link to="/ppic/products" class="btn btn-sm btn-outline-info rounded-pill px-3">
                <i class="bi bi-box-arrow-in-right me-1"></i> Buka
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import MainLayout from "@/layouts/MainLayout.vue";

export default {
  name: 'DashboardPPICPage',
  components: { MainLayout }
}
</script>

<style scoped>
.dashboard-wrapper {
  background-color: #f8f9fb;
  min-height: 100vh;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
}

.dashboard-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
}

/* Grid 2 kolom 2 baris */
.dashboard-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Card Styling */
.dashboard-card {
  transition: all 0.25s ease;
  border-radius: 12px;
  min-height: 120px;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.icon-circle {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
