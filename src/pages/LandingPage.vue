<template>
  <div class="landing-page d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
    <!-- Header -->
    <div class="mb-2">
      <!-- Logo -->
      <div class="d-flex justify-content-center mb-2">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
      </div>

      <!-- Judul profesional -->
      <h3 class="fw-bold text-dark animate-title">Elitech ERP</h3>
      <p class="text-secondary animate-title">
        Sistem Enterprise Resource Planning untuk manajemen produksi & PPIC
      </p>
    </div>

    <!-- Cards -->
    <div class="d-flex justify-content-center flex-wrap gap-4">
      <!-- Card PPIC -->
      <div class="card shadow-lg landing-card" @click="goToPPIC">
        <img src="@/assets/ppic-card.jpg" class="card-img-top" alt="PPIC" />
        <div class="card-body text-center">
          <h5 class="card-title fw-semibold text-dark">Login PPIC</h5>
          <p class="card-text text-secondary">Buat & Kelola Rencana Produksi Perusahaan</p>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-2">
            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk PPIC
            </button>
        </div>
      </div>

      <!-- Card Produksi -->
      <div class="card shadow-lg landing-card" @click="goToProduction">
        <img src="@/assets/production-card.jpg" class="card-img-top" alt="Produksi" />
        <div class="card-body text-center">
          <h5 class="card-title fw-semibold text-dark">Login Produksi</h5>
          <p class="card-text text-secondary">Pantau & Catat Laporan Hasil Produksi</p>
         <button class="btn btn-sm btn-outline-success rounded-pill px-3 mt-2">
            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk Produksi
         </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-5 text-secondary small">
      &copy; 2025 Elitech ERP. All rights reserved.
    </footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'LandingPage',
  setup() {
    const router = useRouter()

    const goToPPIC = () => router.push({ path: '/login', query: { type: 'ppic' } });
    const goToProduction = () => router.push({ path: '/login', query: { type: 'production' } });


    return { goToPPIC, goToProduction }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.landing-page {
  background-color: #f4f6f9;
  font-family: 'Inter', sans-serif;
  animation: fadeIn 1s ease-in;
  padding: 2rem 1rem;
}

/* Logo */
.logo {
  height: 55px;
  width: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

/* Card */
.landing-card {
  cursor: pointer;
  transition: all 0.4s ease;
  width: 270px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: none;
  border-radius: 1rem;
  background-color: #fff;
}

.landing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.25);
  animation: floatCard 2s ease-in-out infinite;
}

.landing-card img {
  height: 150px;
  object-fit: cover;
  border-radius: 1rem 1rem 0 0;
}

.btn-sm {
  transition: all 0.25s ease;
}

.btn-sm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-sm:active {
  transform: scale(0.97);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15) inset;
}


/* Animasi hanya aktif saat hover */
@keyframes floatCard {
  0% { transform: translateY(-6px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(-6px); }
}

/* Tombol interaktif */
.custom-btn {
  transition: all 0.3s ease;
}

.custom-btn.btn-primary:hover {
  background-color: #004bb7;
  border-color: #004bb7;
}

.custom-btn.btn-success:hover {
  background-color: #008b4a;
  border-color: #008b4a;
}

.custom-btn:active {
  transform: scale(0.96);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15) inset;
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-title {
  animation: fadeIn 1s ease-out;
}
</style>
