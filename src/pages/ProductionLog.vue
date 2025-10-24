<template>
  <MainLayout>
    <div class="logs-page p-4">
      <!-- Header & Search + Pagination -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 class="page-title mb-1">Production Logs</h2>
          <p class="text-muted mb-0">Kelola dan cetak logs produksi</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <input
            type="text"
            v-model="_search"
            @input="fetchLogs"
            placeholder="Cari log..."
            class="form-control w-auto"
          />
          <span>Tampilkan</span>
          <select v-model="_perPage" @change="fetchLogs" class="form-select w-auto">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>data</span>
          <button class="btn btn-outline-primary ms-3" @click="_printLogs">
            <i class="bi bi-printer me-1"></i> Cetak
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th @click="sort('id')" class="sortable">ID </th>
              <th @click="sort('log_type')" class="sortable">Log Type </th>
              <th>Plan</th>
              <th>Order</th>
              <th @click="sort('old_status')" class="sortable">Old Status </th>
              <th @click="sort('new_status')" class="sortable">New Status </th>
              <th>Changed By</th>
              <th @click="sort('changed_at')" class="sortable">Changed At </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs.data" :key="log.id">
              <td>{{ log.id }}</td>
              <td>{{ log.log_type }}</td>
              <td>{{ log.plan?.plan_code || '-' }}</td>
              <td>{{ log.order?.order_code || '-' }}</td>
              <td>{{ log.old_status }}</td>
              <td>{{ log.new_status }}</td>
              <td>{{ log.changedBy?.name || '-' }}</td>
              <td>{{ formatDate(log.changed_at) }}</td>
              <td>
                <button class="btn btn-sm btn-info" @click="showDetail(log)">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-end mt-3">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: _page === 1 }">
            <button class="page-link" @click="_page > 1 && (_page--, fetchLogs())">Previous</button>
          </li>
          <li
            v-for="p in _paginationPages"
            :key="p"
            class="page-item"
            :class="{ active: _page === p }"
          >
            <button class="page-link" @click="_page = p; fetchLogs()">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: _page === lastPage }">
            <button class="page-link" @click="_page < lastPage && (_page++, fetchLogs())">Next</button>
          </li>
        </ul>
      </div>

      <!-- Modal Detail -->
      <div v-if="selectedLog" class="modal-backdrop" @click.self="selectedLog = null">
        <div class="modal-dialog shadow rounded">
          <!-- Tombol Close X -->
          <button class="btn-close" @click="selectedLog = null" title="Close">&times;</button>

          <h5 class="mb-3">Detail Log #{{ selectedLog.id }}</h5>
          <ul class="list-group mb-3">
            <li class="list-group-item"><strong>Log Type:</strong> {{ selectedLog.log_type }}</li>
            <li class="list-group-item"><strong>Plan:</strong> {{ selectedLog.plan?.plan_code || '-' }}</li>
            <li class="list-group-item"><strong>Order:</strong> {{ selectedLog.order?.order_code || '-' }}</li>
            <li class="list-group-item"><strong>Old Status:</strong> {{ selectedLog.old_status }}</li>
            <li class="list-group-item"><strong>New Status:</strong> {{ selectedLog.new_status }}</li>
            <li class="list-group-item"><strong>Note:</strong> {{ selectedLog.note }}</li>
            <li class="list-group-item"><strong>Changes:</strong> {{ selectedLog.changes }}</li>
            <li class="list-group-item"><strong>Changed By:</strong> {{ selectedLog.changedBy?.name || '-' }}</li>
            <li class="list-group-item"><strong>Changed At:</strong> {{ formatDate(selectedLog.changed_at) }}</li>
          </ul>

          <!-- Tombol Close bawah -->
          <div class="text-end">
            <button class="btn btn-secondary" @click="selectedLog = null">Close</button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useLogStore } from "@/stores/logStore";
import { generatePDFReport } from "@/utils/generatePdfReport";

const store = useLogStore();
const selectedLog = ref(null);

// Computed
const logs = computed(() => store.logs);
const _page = computed({ get: () => store.pagination.page, set: (val) => store.setPage(val) });
const _perPage = computed({ get: () => store.pagination.perPage, set: (val) => store.setPerPage(val) });
const lastPage = computed(() => store.pagination.lastPage);
const _search = computed({ get: () => store.search, set: (val) => store.setSearch(val) });
const _paginationPages = computed(() => Array.from({ length: lastPage.value }, (_, i) => i + 1));

// Functions
const fetchLogs = async () => await store.fetchLogs();
const sort = (field) => store.setSort(field);
// const getSortIcon = (field) => (store.sortField !== field ? "▲▼" : store.sortOrder === "asc" ? "▲" : "▼");
const formatDate = (date) => new Date(date).toLocaleString();
const showDetail = (log) => selectedLog.value = log;

const _printLogs = () => {
  if (!logs.value.data.length) return;
  const columns = [["ID","Log Type","Plan","Order","Old Status","New Status","Note","Changes","Changed By","Changed At"]];
  const rows = logs.value.data.map(log => [
    log.id,
    log.log_type,
    log.plan?.plan_code || "-",
    log.order?.order_code || "-",
    log.old_status,
    log.new_status,
    log.note,
    log.changes,
    log.changedBy?.name || "-",
    formatDate(log.changed_at),
  ]);
  generatePDFReport({ title: "Production Logs", columns, rows, fileName: `Production_Logs_${Date.now()}.pdf` });
};

onMounted(fetchLogs);
</script>

<style scoped>
.sortable { cursor: pointer; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-dialog {
  width: 500px;
  max-width: 90%;
  position: relative;
  z-index: 1000;
  background: #fff;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: #000;
  z-index: 1010;
}
</style>
