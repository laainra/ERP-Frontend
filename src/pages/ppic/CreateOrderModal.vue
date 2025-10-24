<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditMode ? `Edit Order - ${order.order_code}` : `Buat Order Produksi - ${plan.plan_code}` }}
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
                :max="plan?.quantity"
                min="1"
                required
              />
          <span class="text-small">Max: {{ plan?.quantity }}</span>
            </div>

            <div class="mb-3">
              <label class="form-label">Assign To (Optional)</label>
              <select class="form-select" v-model="localOrder.assigned_to">
                <option value="">-- Pilih Pegawai --</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea class="form-control" v-model="localOrder.notes"></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="btn btn-outline-secondary" @click="close">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          {{ hasOrder ? "Lihat Order" : isEditMode ? "Update Order" : "Create Order" }}
        </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, watch, computed} from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/productionOrderStore";
import generateCode from "@/utils/generateCode";

export default {
  name: "CreateOrderModal",
  props: {
    show: Boolean,
    plan: Object,
    order: Object,
  },
  emits: ["close", "submit", "success"],
  setup(props, { emit }) {
    const loading = ref(false);
    const hasOrder = ref(false); // ✅ untuk tombol "Lihat Order"
    const localOrder = ref({
      order_code: "",
      quantity_target: 0,
      assigned_to: "",
      notes: "",
    });

    const isEditMode = computed(() => !!props.order);
    const userStore = useAuthStore();
    const orderStore = useOrderStore();
    const users = ref([]);

    const fetchUsers = async () => {
      await userStore.fetchUsers();
      users.value = userStore.users || [];
    };

    const checkOrderExist = async () => {
      if (!props.plan?.id) return;
      const orders = await orderStore.fetchOrdersByPlan(props.plan.id);
      hasOrder.value = orders.length > 0;
      if (hasOrder.value) {
        localOrder.value = { ...orders[0] }; // optional, bisa tampil data pertama
      } else {
        localOrder.value = {
          order_code: generateCode("ORD"),
          quantity_target: props.plan.quantity || 0,
          assigned_to: "",
          notes: "",
        };
      }
    };

    watch(() => props.show, async (val) => {
      if (val) {
        await fetchUsers();
        await checkOrderExist();
      }
    });

    const submit = async () => {
      if (hasOrder.value) {
        // kalau sudah ada, bisa langsung buka detail order
        emit("submit", localOrder.value); 
        emit("close");
        return;
      }
      loading.value = true;
      try {
        const newOrder = await orderStore.createOrder({ ...localOrder.value, plan_id: props.plan.id });
        hasOrder.value = true;
        localOrder.value = newOrder;
        emit("success", newOrder);
        emit("close");
      } catch (err) {
        console.error("Failed to save order:", err);
      } finally {
        loading.value = false;
      }
    };

    const close = () => emit("close");

    return { localOrder, submit, loading, close, isEditMode, users, hasOrder };
  },
};
</script>
