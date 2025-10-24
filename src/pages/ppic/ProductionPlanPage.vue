<template>
  <MainLayout>
    <div class="production-page p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="page-title mb-1">Rencana Produksi</h2>
          <p class="text-muted mb-0">Kelola rencana produksi perusahaan</p>
        </div>
        <div>
          <button
            v-if="store.role === 'staff'"
            class="btn btn-primary"
            @click="openCreateModal"
          >
            <i class="bi bi-plus-circle me-1"></i> Buat Rencana
          </button>
          <button class="btn btn-secondary ms-2" @click="openReportModal">
            <i class="bi bi-file-earmark-text me-1"></i> Buat Laporan
          </button>
        </div>
      </div>

      <!-- Search + PerPage -->
      <div
        class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
      >
        <input
          type="text"
          v-model="search"
          @input="fetchPlans"
          placeholder="Search plan..."
          class="form-control w-auto"
        />
        <div class="d-flex align-items-center gap-2">
          <span>Show</span>
          <select
            v-model="perPage"
            @change="changePerPage"
            class="form-select w-auto"
          >
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
              <th @click="sort('plan_code')" class="sortable">
                Plan Code <span>{{ getSortIcon("plan_code") }}</span>
              </th>
              <th>Product</th>
              <th @click="sort('quantity')" class="sortable">
                Quantity <span>{{ getSortIcon("quantity") }}</span>
              </th>
              <th>Status</th>
              <th>Target Finish</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in plans" :key="plan.id">
              <td>{{ plan.plan_code }}</td>
              <td>
                <span
                  style="cursor: pointer"
                  class="text-primary cursor-pointer"
                  @click="openProductDetail(plan)"
                >
                  {{ plan.product?.name }}
                </span>
              </td>
              <td>{{ plan.quantity }}</td>
              <td>
                <span :class="statusClass(plan.status)">
                  {{ getStatusText(plan.status) }}
                </span>
              </td>
              <td>{{ plan.target_finish_date }}</td>
              <td class="d-flex gap-1 flex-wrap">
                <template v-for="btn in actionButtons(plan)" :key="btn.label">
                  <button
                    class="btn btn-sm"
                    :class="btn.color"
                    @click="btnClick(plan, btn.event)"
                    style="flex: 0 0 48%; min-width: 50px; height: 36px"
                  >
                    {{ btn.label }}
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-end mt-3">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="page-- && fetchPlans()">
              Previous
            </button>
          </li>
          <li
            v-for="p in paginationPages"
            :key="p"
            class="page-item"
            :class="{ active: page === p }"
          >
            <button
              class="page-link"
              @click="
                page = p;
                fetchPlans();
              "
            >
              {{ p }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: page === lastPage }">
            <button class="page-link" @click="page++ && fetchPlans()">
              Next
            </button>
          </li>
        </ul>
      </div>

      <!-- Report Modal -->
      <div
        v-if="showReportModal"
        class="modal-backdrop"
        @click.self="closeReportModal"
      >
        <div class="modal-dialog modal-dialog-centered modal-md">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header">
              <h5 class="modal-title">Buat Laporan Produksi</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeReportModal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="exportPlanReport">
                <div class="mb-3">
                  <label class="form-label">Periode</label>
                  <select
                    class="form-select"
                    v-model="reportForm.periodType"
                    required
                  >
                    <option value="range">Range Tanggal</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>

                <div v-if="reportForm.periodType === 'range'" class="mb-3">
                  <label class="form-label">Dari</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="reportForm.startDate"
                    required
                  />
                  <label class="form-label mt-2">Sampai</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="reportForm.endDate"
                    required
                  />
                </div>

                <div v-if="reportForm.periodType === 'weekly'" class="mb-3">
                  <label class="form-label">Minggu Ke-</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    class="form-control"
                    v-model="reportForm.weekNumber"
                    required
                  />
                  <label class="form-label mt-2">Tahun</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    class="form-control"
                    v-model="reportForm.year"
                    required
                  />
                </div>

                <div v-if="reportForm.periodType === 'monthly'" class="mb-3">
                  <label class="form-label">Bulan</label>
                  <select
                    class="form-select"
                    v-model="reportForm.month"
                    required
                  >
                    <option v-for="(m, i) in 12" :key="i" :value="i + 1">
                      {{ i + 1 }}
                    </option>
                  </select>
                  <label class="form-label mt-2">Tahun</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    class="form-control"
                    v-model="reportForm.year"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Informasi Tambahan</label>
                  <textarea
                    class="form-control"
                    v-model="reportForm.additionalInfo"
                  ></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="closeReportModal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Generate & Print PDF
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div
        v-if="showDetailModal"
        class="modal-backdrop"
        @click.self="closeDetail"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header">
              <h5 class="modal-title">
                Detail Plan - {{ detailPlan.plan_code }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDetail"
              ></button>
            </div>
            <div class="modal-body">
              <table class="table table-borderless">
                <tr>
                  <th>Plan Code</th>
                  <td>{{ detailPlan.plan_code }}</td>
                </tr>
                <tr>
                  <th>Product</th>
                  <td>
                    {{ detailPlan.product?.name }} ({{
                      detailPlan.product?.sku
                    }})
                  </td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{{ detailPlan.product?.description }}</td>
                </tr>
                <tr>
                  <th>Quantity</th>
                  <td>
                    {{ detailPlan.quantity }} {{ detailPlan.product?.unit }}
                  </td>
                </tr>
                <tr>
                  <th>Target Finish</th>
                  <td>{{ detailPlan.target_finish_date }}</td>
                </tr>
                <tr>
                  <th>Due Days</th>
                  <td>{{ detailPlan.due_days }}</td>
                </tr>
                <tr>
                  <th>Notes</th>
                  <td>{{ detailPlan.notes }}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span
                      :class="{
                        'badge bg-warning text-dark':
                          detailPlan.status === 'created' ||
                          detailPlan.status === 'pending_approval',
                        'badge bg-success': detailPlan.status === 'approved',
                        'badge bg-danger': detailPlan.status === 'rejected',
                        'badge bg-primary':
                          detailPlan.status === 'converted' ||
                          detailPlan.status === 'in_process',
                      }"
                    >
                      {{ getStatusText(detailPlan.status) }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Creator</th>
                  <td>
                    {{ detailPlan.creator?.name }} ({{
                      detailPlan.creator?.email
                    }})
                  </td>
                </tr>
                <tr>
                  <th>Approver</th>
                  <td>{{ detailPlan.approver?.name || "-" }}</td>
                </tr>
                <tr>
                  <th>Approved At</th>
                  <td>{{ detailPlan.approved_at || "-" }}</td>
                </tr>
                <tr>
                  <th>Created At</th>
                  <td>{{ detailPlan.created_at }}</td>
                </tr>
                <tr>
                  <th>Updated At</th>
                  <td>{{ detailPlan.updated_at }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Detail Modal section -->
      <div
        v-if="showProductModal"
        class="modal-backdrop"
        @click.self="closeProductModal"
      >
        <div class="modal-dialog modal-dialog-centered modal-md">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header">
              <h5 class="modal-title">
                Product Detail - {{ productDetail.name }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="closeProductModal"
              ></button>
            </div>
            <div class="modal-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <table v-else class="table table-borderless">
                <tr>
                  <th>SKU</th>
                  <td>{{ productDetail.sku }}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{{ productDetail.name }}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{{ productDetail.description }}</td>
                </tr>
                <tr>
                  <th>Unit</th>
                  <td>{{ productDetail.unit }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Order Modal -->
      <div
        v-if="showCreateOrderModal"
        class="modal-backdrop"
        @click.self="close"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header">
              <h5 class="modal-title">
                {{
                  isEditModeOrder
                    ? `Edit Order - ${order?.order_code}`
                    : `Buat Order Produksi - ${currentPlan?.plan_code}`
                }}
              </h5>
              <button type="button" class="btn-close" @click="close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submit">
                <div class="mb-3">
                  <label class="form-label">Order Code</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="localOrder.order_code"
                    disabled
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Quantity Target</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="localOrder.quantity_target"
                    :max="currentPlan?.quantity"
                    min="1"
                    required
                  />
                  <span class="text-small"
                    >Max: {{ currentPlan?.quantity }}</span
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Diserahkan Kepada</label>
                  <select class="form-select" v-model="localOrder.assigned_to">
                    <option value="">-- Pilih Pegawai --</option>
                    <option
                      v-for="user in users"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Notes</label>
                  <textarea
                    class="form-control"
                    v-model="localOrder.notes"
                  ></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-3">
        
              
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    {{ isEditModeOrder ? "Update" : "Create" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailt Order Modal -->
      <div
        v-if="showOrderDetailModal"
        class="modal-backdrop"
        @click.self="close"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header">
              <h5 class="modal-title">Detail Order</h5>
              <button type="button" class="btn-close" @click="close"></button>
            </div>

            <div class="modal-body" v-if="!editMode">
              <table class="table table-borderless">
                <tr>
                  <th>Order Code</th>
                  <td>{{ order?.order_code ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Plan Code</th>
                  <td>{{ currentPlan.plan_code }}</td>
                </tr>
                <tr>
                  <th>Product</th>
                  <td>{{ currentPlan.product?.name ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Quantity Target</th>
                  <td>{{ order?.quantity_target ?? currentPlan.quantity }}</td>
                </tr>
                <tr>
                  <th>Quantity Done / Actual</th>
                  <td>
                    {{ order?.quantity_done ?? order?.quantity_actual ?? "-" }}
                  </td>
                </tr>
                <tr>
                  <th>Quantity Remaining / Reject</th>
                  <td>
                    {{
                      order?.quantity_remaining ?? order?.quantity_reject ?? "-"
                    }}
                  </td>
                </tr>
                <tr>
                  <th>Assigned To</th>
                  <td>{{ order?.assigned_to?.name ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{{ order?.status ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Notes</th>
                  <td>{{ currentPlan.notes ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Target Finish Date</th>
                  <td>{{ currentPlan.target_finish_date ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Created At</th>
                  <td>{{ currentPlan.created_at ?? "-" }}</td>
                </tr>
                <tr>
                  <th>Updated At</th>
                  <td>{{ currentPlan.updated_at ?? "-" }}</td>
                </tr>
              </table>
            </div>

            <div class="modal-footer justify-content-center mb-3" v-if="!editMode">
              <button type="button" class="btn btn-warning me-2" @click="startEdit">
                Edit
              </button>
              <button type="button" class="btn btn-danger" @click="confirmDelete">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Plan Modal -->
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditMode ? "Edit Plan" : "Create Plan" }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="closeModal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label class="form-label">Plan Code</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.plan_code"
                    disabled
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Product</label>
                  
                  <select
                    v-model="form.product_id"
                    class="form-select"
                    required
                  >
                  <option value="" disabled>Pilih Produk</option>
                    <option
                      v-for="product in products"
                      :key="product.id"
                      :value="product.id"
                    >
                      {{ product.name }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Quantity</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="form.quantity"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Target Finish Date</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="form.target_finish_date"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Notes</label>
                  <textarea
                    class="form-control"
                    v-model="form.notes"
                  ></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="closeModal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    {{ isEditMode ? "Update" : "Create" }}
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
import { useProductionPlanStore } from "@/stores/productionPlanStore";
import { useOrderStore } from "@/stores/productionOrderStore";
import { useProductStore } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";
import MainLayout from "@/layouts/MainLayout.vue";
import Swal from "sweetalert2";
import generateCode from "@/utils/generateCode";
import { debounce } from 'lodash';
import { generatePDFReport } from "@/utils/generatePdfReport";

export default {
  name: "ProductionPlanPage",
  components: { MainLayout },
  setup() {
    const store = useProductionPlanStore();
    const orderStore = useOrderStore();
    const productStore = useProductStore();
    const userStore = useAuthStore();
    const search = ref("");
    const page = ref(1);
    const perPage = ref(10);
    const lastPage = ref(1);
    const plans = ref([]);
    const reports = ref([]);
    const products = ref([]);

    const showModal = ref(false);
    const isEditMode = ref(false);
    const form = ref({
      plan_code: generateCode("PLAN"),
      product_id: null,
      quantity: 0,
      target_finish_date: "",
      notes: "",
    });
    const loading = ref(false);
    const deletingId = ref(null);
    const approvingId = ref(null);
    const rejectingId = ref(null);
    const editingId = ref(null);
    const showDetailModal = ref(false);
    const detailPlan = ref({});
    const showProductModal = ref(false);
    const productDetail = ref({ sku: "", name: "", description: "", unit: "" });
    const users = ref([]);

    const showCreateOrderModal = ref(false);
    const showOrderDetailModal = ref(false);
    const currentPlan = ref(null);
    const order = ref(null); // selected order for detail
    const localOrder = ref({
      order_code: "",
      quantity_target: 0,
      assigned_to: "",
      notes: "",
    });
    const isEditModeOrder = ref(false);

    const showReportModal = ref(false);
    const reportForm = ref({
      periodType: "range",
      startDate: "",
      endDate: "",
      weekNumber: 1,
      month: 1,
      year: new Date().getFullYear(),
      additionalInfo: "",
    });

    const openReportModal = () => {
      showReportModal.value = true;
    };
    const closeReportModal = () => {
      showReportModal.value = false;
    };

    // jsPDF.API.autoTable = autoTable;

    // const generateReport = async () => {
    //   loading.value = true;
    //   const params = {};
    //   switch (reportForm.value.periodType) {
    //     case "range":
    //       params.type = "custom";
    //       params.from = reportForm.value.startDate;
    //       params.to = reportForm.value.endDate;
    //       break;
    //     case "weekly":
    //       params.type = "weekly";
    //       params.week = reportForm.value.weekNumber;
    //       params.year = reportForm.value.year;
    //       break;
    //     case "monthly":
    //       params.type = "monthly";
    //       params.month = reportForm.value.month;
    //       params.year = reportForm.value.year;
    //       break;
    //   }

    //   await store.fetchPlanReports(params);
    //   reports.value = store.reports || [];

    //   try {
    //     await store.fetchPlanReports();
    //     reports.value = store.reports || [];

    //     const doc = new jsPDF("l", "mm", "a4");
    //     doc.setFontSize(16);
    //     doc.text("Laporan Produksi", 105, 15, { align: "center" });

    //     const headers = [
    //       [
    //         "No",
    //         "Plan Code",
    //         "Product",
    //         "Qty Target",
    //         "Status",
    //         "Progress (%)",
    //         "Approved/Rejected By",
    //         "Approved/Rejected At",
    //         "Additional Info",
    //       ],
    //     ];

    //     const data = reports.value.map((p, idx) => [
    //       idx + 1,
    //       p.plan_code,
    //       p.product_name || p.product?.name || "-",
    //       p.quantity_target || p.quantity,
    //       p.status,
    //       p.progress_percent ?? "-",
    //       p.approved_by ?? "-",
    //       p.approved_at ?? "-",
    //       p.notes ?? "-",
    //     ]);

    //     autoTable(doc, {
    //       head: headers,
    //       body: data,
    //       startY: 25,
    //       theme: "grid",
    //       headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    //     });

    //     if (reportForm.value.additionalInfo) {
    //       const finalY = doc.lastAutoTable.finalY || 25;
    //       doc.setFontSize(12);
    //       doc.text("Info Tambahan:", 10, finalY + 10);
    //       doc.text(reportForm.value.additionalInfo, 10, finalY + 15);
    //     }

    //     doc.save(`Laporan_Produksi_${Date.now()}.pdf`);
    //   } catch (error) {
    //     console.error("Failed to generate report:", error);
    //   } finally {
    //     loading.value = false;
    //   }
    // };


    const exportPlanReport = async () => {
      try {
        loading.value = true;

        // Panggil fetchPlanReports dengan await
        await store.fetchPlanReports();
        reports.value = store.reports || [];

        const headers = [
          [
            "No",
            "Plan Code",
            "Product",
            "Qty Target",
            "Status",
            "Progress (%)",
            "Approved/Rejected By",
            "Approved/Rejected At",
            "Additional Info",
          ],
        ];

        const rows = reports.value.map((p, idx) => [
          idx + 1,
          p.plan_code,
          p.product_name || p.product?.name || "-",
          p.quantity_target || p.quantity,
          p.status,
          p.progress_percent ?? "-",
          p.approved_by ?? "-",
          p.approved_at ?? "-",
          p.notes ?? "-",
        ]);

        generatePDFReport({
          title: "Laporan Produksi",
          columns: headers,
          rows,
          dateRange: `${reportForm.value.startDate} s/d ${reportForm.value.endDate}`, 
          additionalInfo: reportForm.value.additionalInfo,
          fileName: `Laporan_Produksi_${Date.now()}.pdf`,
        });

      } catch (error) {
        console.error("Failed to export plan report:", error);
      } finally {
        loading.value = false;
      }
    };

    const fetchUsers = async () => {
      await userStore.fetchUsers();
      users.value = userStore.users || [];
    };
const fetchPlans = debounce(async () => {
  try {
    const params = {
      page: page.value,
      per_page: perPage.value,
      search: search.value || null,
      sort_field: "id",
      sort_order: "desc",
    };

    const response = await store.fetchPlans(params);

    // Pastikan ambil data yang benar
    if (response?.data) {
      plans.value = response.data;
      lastPage.value = response.last_page || 1;
    } else if (store.plans?.data) {
      plans.value = store.plans.data;
      lastPage.value = store.plans.last_page || 1;
    } else {
      plans.value = [];
    }
  } catch (error) {
    console.error("Error fetching plans:", error);
    plans.value = [];
  }
}, 400);

    const handleSearch = debounce(() => {
      page.value = 1; 
      fetchPlans();
    }, 500);


    const fetchProducts = async () => {
      await productStore.fetchProducts();
      products.value = productStore.products || [];
    };

    const fetchPlanReports = async () => {
      await store.fetchPlanReports();
      reports.value = store.reports || [];
    };

    const changePerPage = () => {
      page.value = 1;
      fetchPlans();
    };

    const sort = (field) => {
      if (store.sortField === field) {
        store.sortOrder = store.sortOrder === "asc" ? "desc" : "asc";
      } else {
        store.sortField = field;
        store.sortOrder = "asc";
      }
      fetchPlans();
    };

    const getSortIcon = (field) => {
      if (store.sortField !== field) return "▲▼";
      return store.sortOrder === "asc" ? "▲" : "▼";
    };

    const openProductDetail = async (plan) => {
      const productId = plan.product?.id;
      if (!productId) {
        Swal.fire("Error", "Product ID not found", "error");
        return;
      }
      try {
        loading.value = true;
        showProductModal.value = true;
        const product = await productStore.getProduct(productId);
        if (product) productDetail.value = product;
        else {
          Swal.fire("Error", "Product not found", "error");
          showProductModal.value = false;
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        Swal.fire("Error", "Failed to load product details", "error");
        showProductModal.value = false;
      } finally {
        loading.value = false;
      }
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      form.value = {
        plan_code: generateCode("PLAN"),
        product_id: "",
        quantity: 0,
        target_finish_date: "",
        notes: "",
      };
      showModal.value = true;
    };

    const openEdit = async (plan) => {
      await fetchProducts();

      if (
        plan.product &&
        !products.value.find((p) => p.id === plan.product.id)
      ) {
        products.value.unshift(plan.product);
      }

      isEditMode.value = true;
      form.value = {
        ...plan,
        product_id: plan.product_id ?? plan.product?.id ?? null,
        plan_code: plan.plan_code ?? generateCode("PLAN"),
      };
      editingId.value = plan.id;
      showModal.value = true;
    };

    const closeProductModal = () => {
      showProductModal.value = false;
    };
    const closeModal = () => {
      showModal.value = false;
      editingId.value = null;
    };
    const submitForm = async () => {
      try {
        loading.value = true;
        if (isEditMode.value) {
          if (form.value.status === "rejected") {
            form.value.status = "pending_approval";
          }
          await store.updatePlan(form.value.id, form.value);
        } else {
          await store.createPlan(form.value);
        }
        closeModal();
        await fetchPlans();
      } finally {
        loading.value = false;
      }
    };

    const deletePlan = async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete!",
        reverseButtons: true,
        preConfirm: async () => {
          deletingId.value = id;
          await store.deletePlan(id);
        },
      });
      deletingId.value = null;
      if (result.isConfirmed) Swal.fire("Deleted!", "", "success");
      await fetchPlans();
    };

    const approvePlan = async (planOrId) => {
      const id = typeof planOrId === "object" ? planOrId.id : planOrId;
      approvingId.value = id;
      try {
        await store.approvePlan(id);
        Swal.fire("Approved!", "", "success");
        await fetchPlans();
      } catch (err) {
        console.error("Approve failed:", err);
        Swal.fire(
          "Error",
          err?.response?.data?.message || "Failed to approve plan",
          "error"
        );
      } finally {
        approvingId.value = null;
      }
    };

    const rejectPlan = async (planOrId) => {
      const id = typeof planOrId === "object" ? planOrId.id : planOrId;
      const { value: reason } = await Swal.fire({
        title: "Reject Reason",
        input: "text",
        inputLabel: "Reason for rejection",
        showCancelButton: true,
      });
      if (reason === undefined || reason === null) return;
      rejectingId.value = id;
      try {
        await store.rejectPlan(id, reason);
        Swal.fire("Rejected!", "", "success");
        await fetchPlans();
      } catch (err) {
        console.error("Reject failed:", err);
        Swal.fire(
          "Error",
          err?.response?.data?.message || "Failed to reject plan",
          "error"
        );
      } finally {
        rejectingId.value = null;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "created":
        case "pending_approval":
          return "Menunggu Persetujuan";
        case "approved":
          return "Disetujui";
        case "rejected":
          return "Ditolak";
        case "converted":
        case "in_process":
          return "Diproses";
        default:
          return status;
      }
    };

    const openDetail = (plan) => {
      detailPlan.value = plan;
      showDetailModal.value = true;
    };
    const closeDetail = () => {
      showDetailModal.value = false;
    };

    // -------------------- order related functions --------------------
    const openCreateOrder = async (plan) => {
      if (plan.status !== "approved") {
        Swal.fire("Warning", "Rencana belum disetujui", "warning");
        return;
      }

      try {
        await fetchUsers(); // Panggil fetchUsers sebelum membuka modal
      } catch (err) {
        console.error("Failed to fetch users:", err);
        Swal.fire("Error", "Failed to load users data", "error");
        return;
      }

      currentPlan.value = plan;
      isEditModeOrder.value = false;
      localOrder.value = {
        order_code: generateCode("ORDER"),
        quantity_target: plan.quantity,
        assigned_to: "",
        notes: "",
      };
      showCreateOrderModal.value = true;
    };
    const submitCreateOrder = async () => {
      loading.value = true;
      try {
        // payload includes plan_id
        const payload = {
          plan_id: currentPlan.value.id,
          order_code: localOrder.value.order_code,
          quantity_target: localOrder.value.quantity_target,
          assigned_to: localOrder.value.assigned_to,
          notes: localOrder.value.notes,
        };
        if (isEditModeOrder.value && order.value?.id) {
          await orderStore.updateOrder(order.value.id, payload);
          Swal.fire("Success", "Order updated", "success");
        } else {
          await orderStore.createOrder(payload);
          Swal.fire("Success", "Order created", "success");
        }
        showCreateOrderModal.value = false;
        await fetchPlans();
      } catch (err) {
        console.error("Order submit failed:", err);
        Swal.fire("Error", "Failed to submit order", "error");
      } finally {
        loading.value = false;
      }
    };

    const openOrderDetail = async (planId) => {
      try {
        loading.value = true;
        // ambil 1 plan beserta order-nya
        const planData = await store.getPlan(planId);
        currentPlan.value = planData;
        order.value = planData.order || null;
        const user = await userStore.getUserById(order.value.assigned_to);
        order.value.assigned_to = user.data ?? user;
        console.log(order);

        showOrderDetailModal.value = true;
      } catch (err) {
        console.error("Failed to fetch plan:", err);
        Swal.fire("Error", "Failed to load plan/order", "error");
      } finally {
        loading.value = false;
      }
    };

    const startEdit = async () => {
      if (!order.value) return;

      try {
        await fetchUsers();
      } catch (err) {
        console.error("Failed to fetch users:", err);
        Swal.fire("Error", "Failed to load users data", "error");
        return;
      }

      isEditModeOrder.value = true;
      localOrder.value = {
        order_code: order.value.order_code,
        quantity_target: order.value.quantity_target,
        assigned_to:
          order.value.assigned_to?.id || order.value.assigned_to || "",
        notes: order.value.notes || "",
      };
      showOrderDetailModal.value = false;
      showCreateOrderModal.value = true;
    };

    const confirmDelete = async () => {
      if (!order.value?.id) return;
      const res = await Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete!",
      });
      if (!res.isConfirmed) return;
      try {
        await orderStore.deleteOrder(order.value.id);
        Swal.fire("Deleted!", "", "success");
        showOrderDetailModal.value = false;
        await fetchPlans();
      } catch (err) {
        console.error("Delete order failed:", err);
        Swal.fire("Error", "Failed to delete order", "error");
      }
    };
    // -----------------------------------------------------------------

    const paginationPages = computed(() => {
      let pages = [];
      for (let i = 1; i <= lastPage.value; i++) pages.push(i);
      return pages;
    });

    onMounted(async () => {
      await Promise.all([fetchPlans(), fetchProducts()]);
    });

    return {
      // stores + data
      store,
      orderStore,
      search,
      page,
      perPage,
      lastPage,
      plans,
      products,
      fetchPlans,
      changePerPage,
      sort,
      getSortIcon,
      paginationPages,
      showModal,
      isEditMode,
      form,
      loading,
      deletingId,
      approvingId,
      rejectingId,
      editingId,
      openCreateModal,
      openEdit,
      closeModal,
      submitForm,
      deletePlan,
      approvePlan,
      rejectPlan,
      getStatusText,
      openDetail,
      closeDetail,
      fetchProducts,
      fetchPlanReports,
      exportPlanReport,
      showDetailModal,
      detailPlan,
      showProductModal,
      productDetail,
      openProductDetail,
      closeProductModal,
      // report
      showReportModal,
      reportForm,
      openReportModal,
      closeReportModal,
      // order
      showCreateOrderModal,
      showOrderDetailModal,
      currentPlan,
      order,
      localOrder,
      isEditModeOrder,
      users,
      openCreateOrder,
      submitCreateOrder,
      openOrderDetail,
      startEdit,
      confirmDelete,
      fetchUsers,
      handleSearch,
      // alias for template close/submit of order modal
      close: () => {
        showCreateOrderModal.value = false;
        showOrderDetailModal.value = false;
      },
      submit: submitCreateOrder,
    };
  },
  methods: {
    actionButtons(plan) {
      const role = this.store.role;
      const buttons = [
        {
          label: "Detail",
          color: "btn-info",
          event: "open-detail",
          show: true,
        },
        {
          label: "Edit",
          color: "btn-warning",
          event: "edit",
          show: role === "staff",
        },
        {
          label: "Delete",
          color: "btn-danger",
          event: "delete",
          show: role === "staff",
        },
        {
          label: "Approve",
          color: "btn-success",
          event: "approve",
          show: role === "manager" && plan.status === "pending_approval",
        },
        {
          label: "Reject",
          color: "btn-danger",
          event: "reject",
          show: role === "manager" && plan.status === "pending_approval",
        },
      ];

      if (role === "staff") {
        buttons.push({
          label: plan.has_order ? "Lihat Order" : "Buat Order",
          color: plan.has_order ? "btn-secondary" : "btn-primary",
          event: plan.has_order ? "view-order" : "create-order",
          show: true,
        });
      }

      return buttons.filter((btn) => btn.show);
    },
    btnClick(plan, event) {
      switch (event) {
        case "open-detail":
          return this.openDetail(plan);
        case "edit":
          return this.openEdit(plan);
        case "delete":
          return this.deletePlan(plan.id);
        case "approve":
          return this.approvePlan(plan.id || plan);
        case "reject":
          return this.rejectPlan(plan.id || plan);
        case "create-order":
          return this.openCreateOrder(plan);
        case "view-order":
          return this.openOrderDetail(plan.id);
        default:
          return;
      }
    },
    statusClass(status) {
      switch (status) {
        case "created":
        case "pending_approval":
          return "badge bg-warning text-dark";
        case "approved":
          return "badge bg-success";
        case "rejected":
          return "badge bg-danger";
        case "converted":
        case "in_process":
          return "badge bg-primary";
        default:
          return "";
      }
    },
  },
};
</script>
