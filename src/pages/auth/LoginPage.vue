<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100">
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay d-flex flex-column justify-content-center align-items-center">
      <div class="spinner-border text-light mb-3" style="width: 3rem; height: 3rem;"></div>
      <p class="text-white fw-semibold">Sedang memproses login...</p>
    </div>

    <!-- Login Card -->
    <div class="login-card p-4 shadow-lg rounded-4 text-center" v-if="!loading">
      <div class="logo-wrapper mb-3">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
      </div>

      <h3 class="fw-bold text-dark mb-4">
        {{ pageType === 'ppic' ? 'Login PPIC' : 'Login Produksi' }}
      </h3>

      <form @submit.prevent="handleLogin">
        <input
          v-model="email"
          type="email"
          class="form-control mb-3"
          placeholder="Email"
          required
        />
        <input
          v-model="password"
          type="password"
          class="form-control mb-4"
          placeholder="Password"
          required
        />
        <button class="btn btn-primary w-100 fw-semibold mb-3" type="submit">
          Login
        </button>
      </form>

      <!-- Tombol ganti mode login -->
      <button
        class="btn btn-outline-secondary w-100"
        @click="switchLoginType"
      >
        {{ pageType === 'ppic' ? 'Login sebagai Produksi' : 'Login sebagai PPIC' }}
      </button>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { useAuthStore } from "../../stores/authStore";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "LoginPage",
  setup() {
    const auth = useAuthStore();
    const router = useRouter();
    const route = useRoute();

    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const pageType = ref("ppic");

    onMounted(() => {
      const type = route.query.type;
      pageType.value = type === "production" ? "production" : "ppic";
    });

    const handleLogin = async () => {
      loading.value = true;
      try {
        await auth.login(email.value, password.value);
        Swal.fire("Success", "Login berhasil", "success");

        if (pageType.value === "production") {
          router.push("/production");
        } else {
          router.push("/ppic");
        }
      } catch (error) {
        Swal.fire("Error", "Login gagal, periksa email/password", "error");
      } finally {
        loading.value = false;
      }
    };

    const switchLoginType = () => {
      // Ganti mode login dan update URL query
      if (pageType.value === "ppic") {
        router.replace({ query: { type: "production" } });
        pageType.value = "production";
      } else {
        router.replace({ query: { type: "ppic" } });
        pageType.value = "ppic";
      }
    };

    return { email, password, handleLogin, loading, pageType, switchLoginType };
  },
};
</script>

<style scoped>
.login-container {
  background: url('@/assets/bg-factory.jpg') center/cover no-repeat;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(60, 60, 60, 0.45);
  backdrop-filter: blur(6px);
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  width: 360px;
  position: relative;
  z-index: 2;
  animation: slideUp 0.7s ease;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 100px;
  height: auto;
  animation: fadeIn 1s ease;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 10;
  text-align: center;
  animation: fadeIn 0.3s ease-in;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
