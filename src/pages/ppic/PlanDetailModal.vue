<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header">
          <h5 class="modal-title">Detail Plan - {{ plan.plan_code }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <table class="table table-borderless">
            <tr><th>Plan Code</th><td>{{ plan.plan_code }}</td></tr>
            <tr><th>Product</th><td>{{ plan.product?.name }} ({{ plan.product?.sku }})</td></tr>
            <tr><th>Quantity</th><td>{{ plan.quantity }} {{ plan.product?.unit }}</td></tr>
            <tr><th>Target Finish</th><td>{{ plan.target_finish_date }}</td></tr>
            <tr><th>Status</th>
              <td><span :class="statusClass(plan.status)">{{ getStatusText(plan.status) }}</span></td>
            </tr>
            <tr><th>Notes</th><td>{{ plan.notes }}</td></tr>
            <tr><th>Creator</th><td>{{ plan.creator?.name }}</td></tr>
            <tr><th>Approver</th><td>{{ plan.approver?.name || '-' }}</td></tr>
            <tr><th>Created At</th><td>{{ plan.created_at }}</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlanDetailModal",
  props: ["show", "plan", "getStatusText"],
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
    }
  }
};
</script>
