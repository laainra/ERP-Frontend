<template>
  <MainLayout>
    <div class="p-4">
      <!-- Header + Actions -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="page-title mb-1">Production Orders</h2>
          <p class="text-muted mb-0">Kelola order produksi perusahaan</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle me-1"></i> Create Order
        </button>
      </div>

      <!-- Table -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Order Code</th>
              <th>Product</th>
              <th>Quantity Target</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.order_code }}</td>
              <td>{{ order.product?.name }}</td>
              <td>{{ order.quantity_target }}</td>
              <td>{{ order.status }}</td>
              <td>{{ order.assignedTo?.name }}</td>
              <td>
                <button class="btn btn-sm btn-info" @click="openDetail(order)">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Create -->
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-dialog modal-dialog-centered modal-fade">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title">Create Production Order</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label class="form-label">Order Code</label>
                  <input type="text" v-model="form.order_code" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Product</label>
                  <select v-model="form.product_id" class="form-select" required>
                    <option value="" disabled>Select product</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Quantity Target</label>
                  <input type="number" v-model="form.quantity_target" class="form-control" min="1" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Assign To</label>
                  <select v-model="form.assigned_to" class="form-select">
                    <option value="" disabled>Select user</option>
                    <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                  </select>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-3">
                  <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useProductionOrderStore } from "@/stores/productionOrderStore";
import { useProductStore } from "@/stores/productStore";
import axios from "axios";

export default {
  name: "ProductionOrderPage",
  components: { MainLayout },
  setup() {
    const store = useProductionOrderStore();
    const productStore = useProductStore();

    const loading = ref(false);
    const showModal = ref(false);
    const form = ref({
      order_code: "",
      product_id: "",
      quantity_target: 1,
      assigned_to: "",
    });

    const orders = computed(() => store.orders);
    const products = computed(() => productStore.products);
    const users = ref([]);

    const fetchUsers = async () => {
      const { data } = await axios.get("/api/users");
      users.value = data;
    };

    const fetchOrders = async () => {
      loading.value = true;
      await store.fetchOrders();
      loading.value = false;
    };

    const openCreateModal = () => {
      form.value = { order_code: "", product_id: "", quantity_target: 1, assigned_to: "" };
      showModal.value = true;
    };
    const closeModal = () => (showModal.value = false);

    const submitForm = async () => {
      try {
        loading.value = true;
        await store.createOrder(form.value);
        await fetchOrders();
        closeModal();
      } catch (err) {
        alert(err.response?.data?.message || "Error");
      } finally {
        loading.value = false;
      }
    };

    const openDetail = (order) => {
      alert(JSON.stringify(order, null, 2));
    };

    onMounted(async () => {
      await productStore.fetchProducts();
      await fetchOrders();
      await fetchUsers();
    });

    return {
      loading,
      orders,
      products,
      users,
      form,
      showModal,
      openCreateModal,
      closeModal,
      submitForm,
      openDetail,
    };
  },
};
</script>
