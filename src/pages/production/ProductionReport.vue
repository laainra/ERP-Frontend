<template>
  <MainLayout>
    <div class="report-page p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="page-title mb-1">Laporan Produksi</h2>
          <p class="text-muted mb-0">Kelola dan cetak laporan hasil produksi</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-1"></i> Buat Laporan
          </button>
          <button class="btn btn-outline-primary" @click="showExportModal = true">
            <i class="bi bi-printer me-1"></i> Cetak Laporan
          </button>
        </div>
      </div>

      <!-- Search + Pagination -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          v-model="search"
          @input="fetchReports"
          placeholder="Cari laporan..."
          class="form-control w-auto"
        />
        <div class="d-flex align-items-center gap-2">
          <span>Tampilkan</span>
          <select v-model="perPage" @change="changePerPage" class="form-select w-auto">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>data</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Order Code</th>
              <th @click="sort('product_name')" class="sortable">
                Produk <span class="sort-icon">{{ getSortIcon('product_name') }}</span>
              </th>
              <th @click="sort('quantity_actual')" class="sortable">
                Produksi <span class="sort-icon">{{ getSortIcon('quantity_actual') }}</span>
              </th>
              <th>Reject</th>
              <th>Status Akhir</th>
              <th>Lokasi</th>
              <th>Tanggal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>{{ report.order_code }}</td>
              <td>{{ report.product_name }}</td>
              <td>{{ report.quantity_actual }}</td>
              <td>{{ report.quantity_reject }}</td>
              <td>
                <span :class="['badge', getStatusClass(report.status_final)]">
                  {{ report.status_final }}
                </span>
              </td>
              <td>{{ report.storage_location || '-' }}</td>
              <td>{{ formatDate(report.report_date) }}</td>
              <td class="d-flex gap-1">
                <button class="btn btn-sm btn-info" @click="openDetail(report)">Detail</button>
                <button class="btn btn-sm btn-warning" @click="openEdit(report)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteReport(report.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-end mt-3">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="page-- && fetchReports()">Previous</button>
          </li>
          <li
            v-for="p in paginationPages"
            :key="p"
            class="page-item"
            :class="{ active: page === p }"
          >
            <button class="page-link" @click="page = p; fetchReports()">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: page === lastPage }">
            <button class="page-link" @click="page++ && fetchReports()">Next</button>
          </li>
        </ul>
      </div>

      <!-- Modal Buat/Edit -->
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title">
                {{ isEditMode ? "Edit Laporan" : "Buat Laporan" }}
              </h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label class="form-label">Order ID</label>
                  <div v-if="isEditMode">
                    <input
                      type="text"
                      class="form-control"
                      :value="getOrderCode(form.order_id)"
                      disabled
                    />
                  </div>

                  <div v-else>
                    <select v-model="form.order_id" class="form-select" required>
                      <option value="">Pilih Order</option>
                      <option
                        v-for="order in orderStore.orders"
                        :key="order.id"
                        :value="order.id"
                      >
                        {{ order.order_code }} - {{ order.product?.name || 'Tanpa Produk' }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Jumlah Produksi Aktual</label>
                  <input type="number" v-model="form.quantity_actual" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Jumlah Reject</label>
                  <input type="number" v-model="form.quantity_reject" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Lokasi Penyimpanan</label>
                  <input type="text" v-model="form.storage_location" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Catatan</label>
                  <textarea v-model="form.notes" class="form-control" rows="3"></textarea>
                </div>
                <div class="text-end">
                  <button class="btn btn-secondary me-2" @click="closeModal">Batal</button>
                  <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
                     <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ isEditMode ? "Update" : "Create" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

        <!-- Modal Detail -->
        <div v-if="showDetailModal" class="modal fade show d-block" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Detail Laporan Produksi</h5>
                <button type="button" class="btn-close" @click="closeDetail"></button>
              </div>
              <div class="modal-body">
                <p><strong>Order Code:</strong> {{ selectedReport.order_code || '-' }}</p>
                <p><strong>Produk:</strong> {{ selectedReport.product_name || '-' }}</p>
                <p><strong>Qty Aktual:</strong> {{ selectedReport.quantity_actual }}</p>
                <p><strong>Qty Reject:</strong> {{ selectedReport.quantity_reject }}</p>
                <p><strong>Status Akhir:</strong> {{ selectedReport.status_final }}</p>
                <p><strong>Lokasi:</strong> {{ selectedReport.storage_location }}</p>
                <p><strong>Tanggal Laporan:</strong> {{ formatDate(selectedReport.report_date) }}</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeDetail">Tutup</button>
              </div>
            </div>
          </div>
        </div>
        <!-- Modal Export -->
      <div v-if="showExportModal" class="modal-backdrop" @click.self="showExportModal = false">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title">Cetak Laporan Produksi</h5>
              <button type="button" class="btn-close" @click="showExportModal = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="handleGenerateReport">
                <div class="mb-3">
                  <label class="form-label">Jenis Laporan</label>
                  <select v-model="exportForm.type" class="form-select" required>
                    <option value="order">Per Order</option>
                    <option value="periodic">Periodik (Mingguan/Bulanan)</option>
                  </select>
                </div>

                <div v-if="exportForm.type === 'order'" class="mb-3">
                  <label class="form-label">Pilih Order</label>
                  <select v-model="exportForm.order_id" class="form-select">
                    <option value="">Pilih Order</option>
                    <option v-for="order in orderStore.orders" :key="order.id" :value="order.id">
                      {{ order.order_code }} - {{ order.product?.name || 'Tanpa Produk' }}
                    </option>
                  </select>
                </div>

                <div v-if="exportForm.type === 'periodic'" class="mb-3">
                  <label class="form-label">Range Tanggal</label>
                  <div class="d-flex gap-2">
                    <input type="date" v-model="exportForm.start_date" class="form-control" required />
                    <input type="date" v-model="exportForm.end_date" class="form-control" required />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Catatan Tambahan</label>
                  <textarea v-model="exportForm.notes" class="form-control" rows="3"></textarea>
                </div>

                <div class="text-end">
                  <button class="btn btn-secondary me-2" @click="showExportModal = false">Batal</button>
                  <button class="btn btn-primary" type="submit">Cetak</button>
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
import { useReportStore } from "@/stores/reportStore";
import MainLayout from "@/layouts/MainLayout.vue";
import Swal from "sweetalert2";
import { useOrderStore } from "@/stores/productionOrderStore";
import { generatePDFReport } from "@/utils/generatePdfReport";

const store = useReportStore();
const orderStore = useOrderStore();
const selectedReport = ref(null);
const showDetailModal = ref(false);
const isSubmitting = ref(false);
const showExportModal = ref(false);
const exportForm = ref({
  type: "periodic", 
  order_id: "",
  start_date: "",
  end_date: "",
  notes: "",
});
const formatDate = (date) => new Date(date).toLocaleDateString();


function openDetail(report) {
  selectedReport.value = report;
  showDetailModal.value = true;
}

function closeDetail() {
  showDetailModal.value = false;
  selectedReport.value = null;
}

function openEdit(report) {
  isEditMode.value = true;
  showModal.value = true; 
  form.value = {
    id: report.id,
    order_id: report.order.id,
    quantity_actual: report.quantity_actual,
    quantity_reject: report.quantity_reject,
    status_final: report.status_final,
    storage_location: report.storage_location,
    notes: report.notes,
  };
}

const reports = computed(() => store.reports);
const page = computed({
  get: () => store.pagination.page,
  set: (val) => (store.pagination.page = val),
});
const perPage = computed({
  get: () => store.pagination.perPage,
  set: (val) => (store.pagination.perPage = val),
});
const lastPage = computed(() => store.pagination.lastPage);
const search = computed({
  get: () => store.search,
  set: (val) => (store.search = val),
});

const showModal = ref(false);
const isEditMode = ref(false);
const form = ref({
  order_id: "",
  quantity_actual: 0,
  quantity_reject: 0,
  storage_location: "",
  notes: "",
});

const fetchReports = async () => await store.fetchReports();

const changePerPage = () => {
  store.pagination.page = 1;
  fetchReports();
};

const sort = (field) => {
  if (store.sortField === field) {
    store.sortOrder = store.sortOrder === "asc" ? "desc" : "asc";
  } else {
    store.sortField = field;
    store.sortOrder = "asc";
  }
  fetchReports();
};

const getSortIcon = (field) => {
  if (store.sortField !== field) return "▲▼";
  return store.sortOrder === "asc" ? "▲" : "▼";
};

const openCreateModal = () => {
  isEditMode.value = false;
  form.value = { order_id: "", quantity_actual: 0, quantity_reject: 0, storage_location: "", notes: "" };
  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

const submitForm = async () => {
  isSubmitting.value = true; 
  try {
    if (isEditMode.value) {
      await store.updateReport(form.value.id, form.value);
    } else {
      await store.createReport(form.value);
    }
    await fetchReports();
    closeModal();
  } catch (e) {
    Swal.fire("Error", e.response?.data?.message || "Terjadi kesalahan", "error");
  } finally {
    isSubmitting.value = false; }
};
const deleteReport = async (id) => {
  const result = await Swal.fire({
    title: "Hapus laporan?",
    text: "Data tidak bisa dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
  });

  if (result.isConfirmed) {
    // Tampilkan Swal loading
    Swal.fire({
      title: 'Menghapus...',
      text: 'Tunggu sebentar',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });

    try {
      await store.deleteReport(id);
      await fetchReports();
      Swal.fire("Berhasil", "Laporan dihapus", "success");
    } catch (e) {
      Swal.fire("Gagal", e.response?.data?.message || "Terjadi kesalahan", "error");
    }
  }
};


const handleGenerateReport = () => {
  let filteredReports = [...reports.value];

  if (exportForm.value.type === "order" && exportForm.value.order_id) {
    filteredReports = filteredReports.filter(
      r => String(r.order.id) === String(exportForm.value.order_id)
    );
  } else if (exportForm.value.type === "periodic") {
    const start = new Date(exportForm.value.start_date);
    const end = new Date(exportForm.value.end_date);
    filteredReports = filteredReports.filter(r => {
      const reportDate = new Date(r.report_date);
      return reportDate >= start && reportDate <= end;
    });
  }

  const columns = [
    ["Order Code", "Produk", "Jumlah Aktual", "Jumlah Reject", "Status Akhir", "Lokasi", "Tanggal"]
  ];
  const rows = filteredReports.map(r => [
    r.order_code,
    r.product_name,
    r.quantity_actual,
    r.quantity_reject,
    r.status_final,
    r.storage_location || "-",
    formatDate(r.report_date),
  ]);

  let dateRange = "";
  if (exportForm.value.type === "order" && exportForm.value.order_id) {
    dateRange = `Order: ${getOrderCode(exportForm.value.order_id)}`;
  } else if (exportForm.value.type === "periodic") {
    dateRange = `Periode: ${exportForm.value.start_date} s/d ${exportForm.value.end_date}`;
  }

  generatePDFReport({
    title: "Laporan Hasil Produksi",
    columns,
    rows,
    dateRange,
    additionalInfo: exportForm.value.notes,
    fileName: `Laporan_Produksi_${Date.now()}.pdf`,
  });

  showExportModal.value = false;
};

const paginationPages = computed(() => {
  return Array.from({ length: lastPage.value }, (_, i) => i + 1);
});

const getOrderCode = (orderId) => {
  const order = orderStore.orders.find(o => o.id === orderId);
  return order ? `${order.order_code} - ${order.product?.name || "Tanpa Produk"}` : "-";
}

const getStatusClass = (status) => {
  switch (status) {
    case "finished":
      return "bg-success"; 
    case "pending":
      return "bg-warning"; 
    case "in_progress":
      return "bg-info"; 
    case "cancelled":
      return "bg-danger"; 
    default:
      return "bg-secondary";
}
};

onMounted(async () => {
  await Promise.all([
    store.fetchReports(),
    orderStore.fetchOrders(), 
  ])
});

</script>

<style scoped>
.sortable {
  cursor: pointer;
}
.modal-backdrop {
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
