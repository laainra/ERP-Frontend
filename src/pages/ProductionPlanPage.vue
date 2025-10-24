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
            <button
              class="btn btn-secondary ms-2"
              @click="openReportModal"
            >
              <i class="bi bi-file-earmark-text me-1"></i> Buat Laporan
            </button>
        </div>
              </div>

      <!-- Search + PerPage -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          v-model="search"
          @input="fetchPlans"
          placeholder="Search plan..."
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


        <PlanTable
        :plans="plans"
        :role="store.role"
        :getStatusText="getStatusText"
        :getSortIcon="getSortIcon"
        @open-detail="openDetail"
        @edit="openEdit"
        @delete="deletePlan"
        @approve="approvePlan"
        @reject="rejectPlan"
        @create-order="openCreateOrderModal"
        @view-order="openOrderDetailModal"
        />

        <CreateOrderModal
        :show="showCreateOrder"
        :plan="selectedPlan"
        @close="showCreateOrder = false"
        @success="onOrderCreated"
        @submit="submitOrder"
        />

        <OrderDetailModal
          v-if="showOrderModal"
          :show="showOrderModal"
          :order="selectedOrder"
          @close="showOrderModal = false"
          @delete="handleDeleteOrder"
          @update="handleUpdateOrder"
        />



      <PlanModal
        :show="showModal"
        :isEditMode="isEditMode"
        :form="form"
        :products="products"
        :loading="loading"
        @close="closeModal"
        @submit="submitForm"
        @view-order="openOrderDetailModal"
      />

      <PlanDetailModal
        :show="showDetailModal"
        :plan="detailPlan"
        :getStatusText="getStatusText"
        @close="closeDetail"
      />

      <ProductDetailModal
        :show="showProductModal"
        :product="productDetail"
        @close="closeProductModal"
      />

      <ReportModal
        :show="showReportModal"
        :reportForm="reportForm"
        @close="closeReportModal"
        @generate="generateReport"
      />

    </div>
  </MainLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useProductionPlanStore } from "@/stores/productionPlanStore";
import { useProductStore } from "@/stores/productStore";
import MainLayout from "@/layouts/MainLayout.vue";
import PlanTable from "@/pages/ppic/PlanTable.vue";
import PlanModal from "@/pages/ppic/CreatePlanModal.vue";
import PlanDetailModal from "@/pages/ppic/PlanDetailModal.vue";
import ProductDetailModal from "@/pages/ppic/ProductDetailModal.vue";
import CreateOrderModal from "@/pages/ppic/CreateOrderModal.vue";
import OrderDetailModal from "@/pages/ppic/OrderDetailModal.vue";
import ReportModal from "@/pages/ppic/ReportModal.vue";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import { useOrderStore } from "@/stores/productionOrderStore";

export default {
  name: "ProductionPlanPage",

    components: {
    MainLayout,
    PlanTable,
    PlanModal,
    PlanDetailModal,
    ProductDetailModal,
    ReportModal,
    OrderDetailModal,
    CreateOrderModal,
  },
  setup() {
    const store = useProductionPlanStore();
    const productStore = useProductStore();
    const orderStore = useOrderStore();
    const search = ref("");
    const page = ref(1);
    const perPage = ref(10);
    const lastPage = ref(1);
    const plans = ref([]);
    const reports = ref([]);
    const products = ref([]);

    const showModal = ref(false);
    const isEditMode = ref(false);
    const form = ref({});
    const loading = ref(false);
    const deletingId = ref(null);
    const approvingId = ref(null);
    const rejectingId = ref(null);
    const editingId = ref(null);
    const showDetailModal = ref(false);
    const detailPlan = ref({});
    const showProductModal = ref(false);
    const productDetail = ref({ sku: "", name: "", description: "", unit: "" });
    const showReportModal = ref(false);
    const showCreateOrder = ref(false);
    const showOrderModal = ref(false);
    const selectedOrder = ref(null);
    


    const selectedPlan = ref(null);

    const openOrderDetailModal =  async (payload) => {
     if (!payload) return;
      showOrderModal.value = true;


      if (payload.id && payload.plan) {
        selectedOrder.value = payload;
        return;
      }

      if (payload.order) {
        selectedOrder.value = payload.order;
        return;
      }

      const plan = payload;
      let order = plan.order || null;

            if (!order) {
        try {
          const orders = await orderStore.fetchOrdersByPlan(plan.id); // pastikan method ada di store
          order = Array.isArray(orders) ? orders[0] : orders;
        } catch (err) {
          console.error('Failed to fetch order by plan:', err);
        }
      }

      if (order) {
        selectedOrder.value = order;
      } else {
        showOrderModal.value = false;
        Swal.fire('Info', 'Order tidak ditemukan untuk plan ini', 'info');
      }
    };

    const openCreateOrderModal = (plan) => {
    selectedPlan.value = plan;
    showCreateOrder.value = true;
  };

    const submitOrder = async (orderData) => {
      // panggil store atau API untuk submit order
      console.log("Submitting order:", orderData);
      showCreateOrder.value = false;
    };
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

    jsPDF.API.autoTable = autoTable;

    const generateReport = async () => {
    loading.value = true;

    // Build params
    const params = {};
    switch (reportForm.value.periodType) {
        case "range":
        params.type = "custom";
        params.from = reportForm.value.startDate;
        params.to = reportForm.value.endDate;
        break;
        case "weekly":
        params.type = "weekly";
        params.week = reportForm.value.weekNumber;
        params.year = reportForm.value.year;
        break;
        case "monthly":
        params.type = "monthly";
        params.month = reportForm.value.month;
        params.year = reportForm.value.year;
        break;
    }

    await store.fetchPlanReports(params);
    reports.value = store.reports || [];

    try {
        await store.fetchPlanReports();
        reports.value = store.reports || [];

        const doc = new jsPDF("p", "mm", "a4");
        doc.setFontSize(16);
        doc.text("Laporan Produksi", 105, 15, { align: "center" });

        // Header table
        const headers = [[
        "No",
        "Plan Code",
        "Product",
        "Qty Target",
        "Status",
        "Progress (%)",
        "Approved/Rejected By",
        "Approved/Rejected At",
        "Additional Info",
        ]];

        // Data
        const data = reports.value
        .map((plan, idx) => [
            idx + 1,
            plan.plan_code,
            plan.product_name || plan.product?.name || "-",
            plan.quantity_target || plan.quantity,
            plan.status,
            plan.progress_percent ?? "-",
            plan.approved_by ?? "-",
            plan.approved_at ?? "-",
            plan.notes ?? "-",
            plan.additional_info ?? "-",

        ]);

        autoTable(doc, {
        head: headers,
        body: data,
        startY: 25,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        // Info tambahan
        if (reportForm.value.additionalInfo) {
        const finalY = doc.lastAutoTable.finalY || 25;
        doc.setFontSize(12);
        doc.text("Info Tambahan:", 10, finalY + 10);
        doc.text(reportForm.value.additionalInfo, 10, finalY + 15);
        }

        doc.save(`Laporan_Produksi_${Date.now()}.pdf`);
    } catch (error) {
        console.error("Failed to generate report:", error);
    } finally {
        loading.value = false;
    }
    };

const fetchPlans = async () => {
  await store.fetchPlans();
  plans.value = store.plans || [];

  
  
  await orderStore.fetchOrders(); 

  plans.value = plans.value.map(plan => {
    const existingOrder = orderStore.orders.find(o => o.plan_id === plan.id);
    return {
      ...plan,
      has_order: !!existingOrder,
      order: existingOrder || null 
    };
  });

  lastPage.value = store.pagination.lastPage || 1;
};


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
    Swal.fire('Error', 'Product ID not found', 'error');
    return;
  }

  try {
    loading.value = true;
    showProductModal.value = true;
    
    const product = await productStore.getProduct(productId);

    if (product) {
      productDetail.value = product;
    } else {
      Swal.fire('Error', 'Product not found', 'error');
      showProductModal.value = false;
    }
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    Swal.fire('Error', 'Failed to load product details', 'error');
    showProductModal.value = false;
  } finally {
    loading.value = false;
  }
};

    const openCreateModal = async () => {
    await fetchProducts();
      isEditMode.value = false;
      form.value = {
        plan_code: "",
        product_id: products.value[0]?.id || null,
        quantity: 0,
        target_finish_date: "",
        notes: "",
      };
      showModal.value = true;
    };

    const openEdit = (plan) => {
      isEditMode.value = true;
      form.value = { ...plan };
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

    const approvePlan = async (id) => {
      approvingId.value = id;
      await store.approvePlan(id);
      approvingId.value = null;
      Swal.fire("Approved!", "", "success");
      await fetchPlans();
    };

    const rejectPlan = async (id) => {
      const { value: reason } = await Swal.fire({
        title: "Reject Reason",
        input: "text",
        inputLabel: "Reason for rejection",
        showCancelButton: true,
      });
      if (reason !== undefined) {
        rejectingId.value = id;
        await store.rejectPlan(id, reason);
        rejectingId.value = null;
        Swal.fire("Rejected!", "", "success");
        await fetchPlans();
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'created':
        case 'pending_approval':
          return 'Menunggu Persetujuan';
        case 'approved':
          return 'Disetujui';
        case 'rejected':
          return 'Ditolak';
        case 'converted':
        case 'in_process':
          return 'Diproses';
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

    const onOrderCreated = (order) => {

      const plan = plans.value.find(p => p.id === order.plan_id);
      if (plan) {
        if (!plan.orders) plan.orders = [];
        plan.orders.push(order);
      }
    };

    const paginationPages = computed(() => {
      let pages = [];
      for (let i = 1; i <= lastPage.value; i++) pages.push(i);
      return pages;
    });

    onMounted(async () => {
      await Promise.all([fetchPlans(), fetchProducts()]); 
    });

    return {
      store,
      search,
      page,
      perPage,
      lastPage,
      plans,
      products,
      fetchPlans,
      onOrderCreated,
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
      showDetailModal,
      detailPlan,
      showProductModal,
      productDetail,
      openProductDetail,
      closeProductModal,
      showReportModal,
      reportForm,
      openReportModal,
      closeReportModal,
      generateReport,
      showCreateOrder,
      selectedPlan,
      openCreateOrderModal,
      submitOrder,
      openOrderDetailModal,
      selectedOrder,
      showOrderModal,
    };
  },
};
</script>
