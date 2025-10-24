<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header">
          <h5 class="modal-title">
            Detail Order
          </h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body" v-if="!editMode">
          <table class="table table-borderless">
            <tr><th>Order Code</th><td>{{ order.order_code }}</td></tr>
            <tr><th>Plan Code</th><td>{{ order.plan.plan_code }}</td></tr>
            <tr><th>Product</th><td>{{ order.product?.name }}</td></tr>
            <tr><th>Quantity Target</th><td>{{ order.quantity_target }}</td></tr>
            <tr><th>Quantity Actual</th><td>{{ order.quantity_actual ?? "-" }}</td></tr>
            <tr><th>Quantity Reject</th><td>{{ order.quantity_reject ?? "-" }}</td></tr>
            <tr><th>Assigned To</th><td>{{ order.assigned_to?.name || "-" }}</td></tr>
            <tr><th>Status</th><td>{{ order.status }}</td></tr>
            <tr><th>Notes</th><td>{{ order.notes }}</td></tr>
            <tr><th>Created At</th><td>{{ order.created_at }}</td></tr>
            <tr><th>Updated At</th><td>{{ order.updated_at }}</td></tr>
          </table>
        </div>


        <!-- Render CreateOrderModal for editing -->
        <CreateOrderModal
          v-if="editMode"
          :show="editMode"
          :plan="order.plan"
          :order="order"
          @close="editMode = false"
          @submit="handleUpdate"
        />

        <div class="modal-footer" v-if="!editMode">
          <button type="button" class="btn btn-outline-secondary" @click="close">Close</button>
          <button type="button" class="btn btn-warning" @click="startEdit">Edit</button>
          <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import Swal from "sweetalert2";
import CreateOrderModal from "./CreateOrderModal.vue";

export default {
  name: "OrderDetailModal",
  components: { CreateOrderModal },
  props: {
    show: Boolean,
    order: Object,
  },
  emits: ["close", "delete", "update"],
  setup(props, { emit }) {
    const editMode = ref(false);

    const close = () => emit("close");

    const startEdit = () => {
      editMode.value = true; // show CreateOrderModal sebagai edit
    };

    const handleUpdate = async (updatedOrder) => {
      await emit("update", updatedOrder);
      editMode.value = false;
      close();
    };

    const confirmDelete = async () => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the order!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete!",
      });
      if (result.isConfirmed) {
        await emit("delete", props.order.id);
        close();
        Swal.fire("Deleted!", "Order has been deleted.", "success");
      }
    };

    return { editMode, startEdit, close, confirmDelete, handleUpdate };
  },
};
</script>
