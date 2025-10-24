<template>
  <div class="table-responsive shadow-sm rounded">
    <table class="table table-hover mb-0">
      <thead class="table-light">
        <tr>
          <th @click="$emit('sort', 'plan_code')" class="sortable d-flex align-items-center">
            <span>Plan Code</span>
            <span class="ms-1">{{ getSortIcon('plan_code') }}</span>
          </th>
          <th>Product</th>
          <th @click="$emit('sort', 'quantity')" class="sortable d-flex align-items-center">
            <span>Quantity</span>
            <span class="ms-1">{{ getSortIcon('quantity') }}</span>
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
              style="cursor: pointer;"
              class="text-primary cursor-pointer"
              @click="$emit('open-product-detail', plan)"
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
          <td class="d-flex flex-wrap gap-2 text-center">
            <template v-for="btn in actionButtons(plan)" :key="btn.label">
              <button
                class="btn btn-sm"
                :class="btn.color"
                @click="btnClick(plan, btn.event)"
                style="flex: 0 0 48%; min-width: 50px; height:36px;"
              >
                {{ btn.label }}
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="d-flex justify-content-end mt-3">
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <button class="page-link" @click="prevPage">Previous</button>
        </li>
        <li v-for="p in paginationPages" :key="p" class="page-item" :class="{ active: page === p }">
          <button class="page-link" @click="goToPage(p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: page === lastPage }">
          <button class="page-link" @click="nextPage">Next</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: "PlanTable",
  props: {
    plans: Array,
    role: String,
    getStatusText: Function,
    getSortIcon: Function,
  },
  data() {
    return {
      page: 1,
      lastPage: 1,
    }
  },
  computed: {
    paginationPages() {
      let pages = [];
      for (let i = 1; i <= this.lastPage; i++) pages.push(i);
      return pages;
    }
  },
  methods: {
    statusClass(status) {
      switch(status){
        case 'created':
        case 'pending_approval': return 'badge bg-warning text-dark';
        case 'approved': return 'badge bg-success';
        case 'rejected': return 'badge bg-danger';
        case 'converted':
        case 'in_process': return 'badge bg-primary';
        default: return '';
      }
    },
    actionButtons(plan) {
      const role = this.role;
      const buttons = [
        { label: 'Detail', color: 'btn-info', event: 'open-detail', show: true },
        { label: 'Edit', color: 'btn-warning', event: 'edit', show: role === 'staff' },
        { label: 'Delete', color: 'btn-danger', event: 'delete', show: role === 'staff' },
        { label: 'Approve', color: 'btn-success', event: 'approve', show: role === 'manager' && plan.status === 'pending_approval' },
        { label: 'Reject', color: 'btn-danger', event: 'reject', show: role === 'manager' && plan.status === 'pending_approval' },
      ];

      if (role === 'staff') {
        buttons.push({
          label: plan.has_order ? 'Lihat Order' : 'Buat Order',
          color: plan.has_order ? 'btn-secondary' : 'btn-primary',
          // send the whole plan to parent; parent will resolve order
          event: plan.has_order ? 'view-order' : 'create-order',
          show: true
        });
      }

      return buttons.filter(btn => btn.show);
    },
    btnClick(plan, event) {
      if (event === 'delete') this.$emit(event, plan.id);
      else if (event === 'view-order') this.$emit('view-order', plan); // emit plan (parent will resolve order)
      else if (event === 'create-order') {
        if (plan.status !== 'approved') {
          Swal.fire({
            icon: 'warning',
            title: 'Rencana Produksi Belum Disetujui',
            text: 'Tidak bisa membuat order sebelum rencana disetujui',
          });
        } else {
          this.$emit(event, plan);
        }
      } else this.$emit(event, plan);
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.$emit('change-page', this.page);
      }
    },
    nextPage() {
      if (this.page < this.lastPage) {
        this.page++;
        this.$emit('change-page', this.page);
      }
    },
    goToPage(p) {
      this.page = p;
      this.$emit('change-page', this.page);
    }
  }
};
</script>