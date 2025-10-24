<template>
  <MainLayout>
    <div class="order-page p-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="page-title mb-1">Daftar Order Produksi</h2>
          <p class="text-muted mb-0">Kelola order produksi dengan mudah</p>
        </div>
      </div>

      <!-- Search + Per Page -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          v-model="search"
          @input="fetchOrders"
          placeholder="Search order..."
          class="form-control w-auto"
        />
        <div class="d-flex align-items-center gap-2">
          <span>Show</span>
          <select v-model="perPage" @change="changePerPage" class="form-select w-auto">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th @click="sort('order_code')" class="sortable">
                Kode Order <span class="sort-icon">{{ getSortIcon('order_code') }}</span>
              </th>
              <th>Produk</th>
              <th>Jumlah Target</th>
              <th>Target Tanggal Penyelesaian</th>
              <th>Status</th>
              <th>Diperbarui oleh</th>
              <th>Diperbarui pada</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.order_code }}</td>
              <td>{{ order.product?.name || '-' }}</td>
              <td>{{ order.quantity_target || '-' }}</td>
              <td>{{ order.plan.target_finish_date || '-' }}</td>
              <td>
                <span :class="['badge', getStatusBadge(order.status)]">{{ order.status }}</span>
              </td>
             <td>{{ order.logs[order.logs.length - 1]?.changed_by?.name || '-' }}</td>
              <td>{{ formatDate(order.updated_at) }}</td>
              <td class="d-flex gap-1">
                <button class="btn btn-sm btn-info" @click="openDetail(order)">Detail</button>
                <button class="btn btn-sm btn-warning" @click="openStatusModal(order)">Update Status</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-end mt-3">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="prevPage">Previous</button>
          </li>
          <li
            v-for="p in paginationPages"
            :key="p"
            class="page-item"
            :class="{ active: page === p }"
          >
            <button class="page-link" @click="goToPage(p)">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: page === lastPage }">
            <button class="page-link" @click="nextPage">Next</button>
          </li>
        </ul>
      </div>

      <!-- Detail Modal -->
      <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
        <div class="modal-dialog modal-dialog-centered modal-fade">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title">Detail Order</h5>
              <button type="button" class="btn-close" @click="closeDetailModal"></button>
            </div>
            <div class="modal-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>Order Code:</strong> {{ detailOrder.order_code }}</li>
                <li class="list-group-item"><strong>Product:</strong> {{ detailOrder.product?.name }}</li>
                <li class="list-group-item"><strong>Quantity Target:</strong> {{ detailOrder.quantity_target }}</li>
                <li class="list-group-item"><strong>Quantity Done:</strong> {{ detailOrder.quantity_done }}</li>
                <li class="list-group-item"><strong>Quantity Remaining:</strong> {{ detailOrder.quantity_remaining }}</li>
                <li class="list-group-item"><strong>Status:</strong> {{ detailOrder.status }}</li>
                <li class="list-group-item"><strong>Assigned To:</strong> {{ detailOrder.assigned_to?.name }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Status Modal -->
      <div v-if="showStatusModal" class="modal-backdrop" @click.self="closeStatusModal">
        <div class="modal-dialog modal-dialog-centered modal-fade">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title">Update Status</h5>
              <button type="button" class="btn-close" @click="closeStatusModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitStatus">
                <div class="mb-3">
                  <label class="form-label fw-medium">Status Baru</label>
                  <select v-model="statusForm.status" class="form-select" required>
                    <option value="waiting">Waiting</option>
                    <option value="in_process">In Process</option>
                    <option value="finished">Finished</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Quantity Done</label>
                  <input type="number" class="form-control" v-model="statusForm.quantity_done" min="0" />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary" @click="closeStatusModal">Cancel</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Update
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

<script setup>
import { ref, computed, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useOrderStore } from "@/stores/productionOrderStore";
import Swal from "sweetalert2";

const store = useOrderStore();
const loading = ref(false);
const search = ref("");
const perPage = ref(10);
const page = ref(1);
const sortField = ref("order_code");
const sortOrder = ref("asc");

const orders = computed(() => store.orders);
const lastPage = ref(1);

const showDetailModal = ref(false);
const detailOrder = ref({});
const showStatusModal = ref(false);
const statusForm = ref({ id: null, status: "", quantity_done: 0 });

const fetchOrders = async () => {
  try {
    loading.value = true;

    const params = {
      page: page.value,
      per_page: perPage.value,
      sort_field: sortField.value,
      sort_order: sortOrder.value,
    };

    if (search.value.trim() !== "") {
      params.search = search.value.trim();
    }

    await store.fetchOrders(params);
    lastPage.value = store.pagination.lastPage;
  } finally {
    loading.value = false;
  }
};


const changePerPage = () => {
  page.value = 1;
  fetchOrders();
};

const sort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
  fetchOrders();
};

const getSortIcon = (field) => {
  if (sortField.value !== field) return "▲▼";
  return sortOrder.value === "asc" ? "▲" : "▼";
};

const paginationPages = computed(() => {
  const pages = [];
  for (let i = 1; i <= lastPage.value; i++) {
    pages.push(i);
  }
  return pages;
});

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    fetchOrders();
  }
};
const nextPage = () => {
  if (page.value < lastPage.value) {
    page.value++;
    fetchOrders();
  }
};
const goToPage = (p) => {
  page.value = p;
  fetchOrders();
};

const openDetail = (order) => {
  detailOrder.value = { ...order };
  showDetailModal.value = true;
};
const closeDetailModal = () => (showDetailModal.value = false);

const openStatusModal = (order) => {
  statusForm.value = {
    id: order.id,
    status: order.status,
    quantity_done: order.quantity_done,
  };
  showStatusModal.value = true;
};
const closeStatusModal = () => (showStatusModal.value = false);

const submitStatus = async () => {
  try {
    loading.value = true;
    await store.updateStatus(statusForm.value.id, {
      new_status: statusForm.value.status,
      quantity_done: statusForm.value.quantity_done,
    });
    Swal.fire("Success!", "Status updated successfully.", "success");
    closeStatusModal();
    fetchOrders();
  } catch (err) {
    Swal.fire("Error", err.response?.data?.message || "Failed to update status", "error");
  } finally {
    loading.value = false;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "waiting": return "bg-secondary";
    case "in_process": return "bg-warning";
    case "finished": return "bg-success";
    case "rejected": return "bg-danger";
    default: return "bg-light text-dark";
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("id-ID");
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.sortable {
  cursor: pointer;
}
.badge {
  text-transform: capitalize;
}
</style>
