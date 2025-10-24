<template>
  <MainLayout>
    <div class="product-page p-4">



      <!-- Header + Actions -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="page-title mb-1">Daftar Produk</h2>
          <p class="text-muted mb-0">Kelola produk perusahaan dengan mudah</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle me-1"></i> Create Product
        </button>
      </div>

      <!-- Search + Per Page -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          v-model="search"
          @input="fetchProducts"
          placeholder="Search product..."
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
              <!-- <th @click="sort('id')" class="sortable">
                ID <span class="sort-icon">{{ getSortIcon('id') }}</span>
              </th> -->
              <th @click="sort('sku')" class="sortable">
                SKU <span class="sort-icon">{{ getSortIcon('sku') }}</span>
              </th>
              <th @click="sort('name')" class="sortable">
                Name <span class="sort-icon">{{ getSortIcon('name') }}</span>
              </th>
              <th>Description</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <!-- <td>{{ product.id }}</td> -->
              <td>{{ product.sku }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.description }}</td>
              <td>{{ product.unit }}</td>
              <td class="d-flex gap-1">
                <button class="btn btn-sm btn-info" @click="openDetail(product)">Detail</button>
                <button class="btn btn-sm btn-warning" @click="openEdit(product)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteProduct(product.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-end mt-3">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="page-- && fetchProducts()">Previous</button>
          </li>
          <li
            v-for="p in paginationPages"
            :key="p"
            class="page-item"
            :class="{ active: page === p }"
          >
            <button class="page-link" @click="page = p; fetchProducts()">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: page === lastPage }">
            <button class="page-link" @click="page++ && fetchProducts()">Next</button>
          </li>
        </ul>
      </div>

      <!-- Detail Modal -->
      <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
        <div class="modal-dialog modal-dialog-centered modal-fade">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title">Detail Product</h5>
              <button type="button" class="btn-close" @click="closeDetailModal"></button>
            </div>
            <div class="modal-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>ID:</strong> {{ detailProduct.id }}</li>
                <li class="list-group-item"><strong>SKU:</strong> {{ detailProduct.sku }}</li>
                <li class="list-group-item"><strong>Name:</strong> {{ detailProduct.name }}</li>
                <li class="list-group-item"><strong>Description:</strong> {{ detailProduct.description }}</li>
                <li class="list-group-item"><strong>Unit:</strong> {{ detailProduct.unit }}</li>
              </ul>
            </div>
     
          </div>
        </div>
      </div>

     
      <!-- Modal Create / Edit -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered modal-fade">
          <div class="modal-content shadow-lg border-0">
          <div class="modal-header border-bottom-0">
              <h5 class="modal-title">{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
              <form @submit.prevent="submitForm" class="modal-form">
              <div class="mb-3">
                  <label class="form-label fw-medium">SKU</label>
                  <input type="text" class="form-control" v-model="form.sku" :disabled="isEditMode"/>
              </div>
              <div class="mb-3">
                  <label class="form-label fw-medium">Name</label>
                  <input type="text" class="form-control" v-model="form.name" required/>
              </div>
              <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea class="form-control" v-model="form.description" rows="3"></textarea>
              </div>
              <div class="mb-3">
                  <label class="form-label fw-medium">Unit</label>
                    <select class="form-select" v-model="form.unit" required>
                  <option value="" disabled>Pilih unit</option>
                  <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-3">
                  <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isEditMode ? 'Update' : 'Create' }}
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

<script>import { ref, computed, onMounted } from "vue";
import { useProductStore } from "@/stores/productStore";
import MainLayout from "@/layouts/MainLayout.vue";
import Swal from 'sweetalert2';


export default {
    name: "ProductsPage",
  components: { MainLayout },
  setup() {
    const store = useProductStore();

    const loading = ref(false);
    const showModal = ref(false);
    const isEditMode = ref(false);
    const showDetailModal = ref(false);
    const detailProduct = ref({});
    const form = ref({ id: null, sku: "", name: "", description: "", unit: "" });
    const units = ["pcs", "kg", "liter", "box"];

    const page = computed({
      get: () => store.pagination.page,
      set: (val) => (store.pagination.page = val),
    });
    const perPage = computed({
      get: () => store.pagination.perPage,
      set: (val) => (store.pagination.perPage = val),
    });
    const lastPage = computed(() => store.pagination.lastPage);
    const products = computed(() => store.products);
    const search = computed({
      get: () => store.search,
      set: (val) => (store.search = val),
    });

    const getSortIcon = (field) => {
        if (store.sortField !== field) return "▲▼"; 
        return store.sortOrder === "asc" ? "▲" : "▼"; 
      };


    const fetchProducts = async () => {
      try {
        loading.value = true;
        await store.fetchProducts();
      } finally {
        loading.value = false;
      }
    };

    const changePerPage = () => {
      store.pagination.page = 1;
      fetchProducts();
    };

    const sort = (field) => {
      if (store.sortField === field) {
        store.sortOrder = store.sortOrder === "asc" ? "desc" : "asc";
      } else {
        store.sortField = field;
        store.sortOrder = "asc";
      }
      fetchProducts();
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      form.value = { id: null, sku: "", name: "", description: "", unit: "" };
      showModal.value = true;
    };

    const openEdit = (product) => {
      isEditMode.value = true;
      form.value = { ...product };
      showModal.value = true;
    };

    const closeModal = () => (showModal.value = false);

    const submitForm = async () => {
      try {
        loading.value = true;
        if (isEditMode.value) {
          await store.updateProduct(form.value.id, form.value);
        } else {
          await store.createProduct(form.value);
        }
        await fetchProducts();
        closeModal();
      } catch (error) {
        alert(error.response?.data?.message || "Error");
      } finally {
        loading.value = false;
      }
    };

    const deleteProduct = async (id) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await store.deleteProduct(id);
            await fetchProducts();
            return true;
          } catch (error) {
    
            if (error.response?.data?.message?.includes('1451') ||
                error.response?.data?.message?.toLowerCase().includes('foreign key')) {
              Swal.showValidationMessage(
                `Cannot delete this product! It is still used in production plans.`
              );
            } else {
              Swal.showValidationMessage(
                `Request failed: ${error.response?.data?.message || error.message || 'Unknown error'}`
              );
            }
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      }
    };




    const openDetail = (product) => {
      detailProduct.value = { ...product };
      showDetailModal.value = true;
    };

    const closeDetailModal = () => (showDetailModal.value = false);

    const paginationPages = computed(() => {
      let pages = [];
      for (let i = 1; i <= lastPage.value; i++) pages.push(i);
      return pages;
    });

    // ✅ Panggil saat halaman load
    onMounted(() => {
      fetchProducts();
    });

        return {
      loading,
      products,
      units,
      page,
      perPage,
      lastPage,
      search,
      showModal,
      showDetailModal,
      isEditMode,
      form,
      detailProduct,
      fetchProducts,
      changePerPage,
      sort,
      openCreateModal,
      openEdit,
      closeModal,
      submitForm,
      deleteProduct,
      openDetail,
      closeDetailModal,
      getSortIcon,
      paginationPages,
    };
  },
};
</script>
