<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditModeRef ? 'Edit Plan' : 'Create Plan' }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">Plan Code</label>
              <input type="text" class="form-control" v-model="localForm.plan_code" disabled />
            </div>
            <div class="mb-3">
              <label class="form-label">Product</label>
              <select v-model="localForm.product_id" class="form-select" required>
                <option disabled value="">-- Pilih Produk --</option>
                <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Quantity</label>
              <input type="number" class="form-control" v-model.number="localForm.quantity" required min="1" />
            </div>
            <div class="mb-3">
              <label class="form-label">Target Finish Date</label>
              <input type="date" class="form-control" v-model="localForm.target_finish_date" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea class="form-control" v-model="localForm.notes"></textarea>
            </div>
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditModeRef ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import generateCode from "@/utils/generateCode";
import { ref, watch, toRefs } from "vue";
import { useProductionPlanStore } from "@/stores/productionPlanStore";
import Swal from "sweetalert2";

export default {
  name: "PlanModal",
  props: {
    show: Boolean,
    isEditMode: Boolean,
    form: Object,
    products: Array,
  },
  setup(props, { emit }) {
    const store = useProductionPlanStore();
    const { isEditMode: isEditModeRef } = toRefs(props);

    const loading = ref(false);
    const errorMessage = ref("");

    const localForm = ref({
      plan_code: props.form?.plan_code || generateCode("PLAN"),
      product_id: props.form?.product_id || (props.products[0]?.id ?? ""),
      quantity: props.form?.quantity || 1,
      target_finish_date: props.form?.target_finish_date || "",
      notes: props.form?.notes || "",
    });

    watch(
      () => props.show,
      (val) => {
        if (val) {
          localForm.value.plan_code = props.isEditMode ? props.form.plan_code : generateCode("PLAN");
          localForm.value.product_id = props.form?.product_id || (props.products[0]?.id ?? "");
          localForm.value.quantity = props.form?.quantity || 1;
          localForm.value.target_finish_date = props.form?.target_finish_date || "";
          localForm.value.notes = props.form?.notes || "";
          errorMessage.value = "";
        }
      }
    );

    const validate = () => {
      if (!localForm.value.product_id) return "Product is required";
      if (!localForm.value.quantity || localForm.value.quantity <= 0) return "Quantity must be greater than 0";
      if (!localForm.value.target_finish_date) return "Target Finish Date is required";
      return null;
    };

    const closeModal = () => {
      emit("close");
    };

    const submit = async () => {
      errorMessage.value = "";
      const error = validate();
      if (error) {
        errorMessage.value = error;
        console.warn("Validation failed:", error);
        return;
      }

      const payload = { ...localForm.value };
      console.log("Submitting payload:", payload);

      loading.value = true;
      try {
        if (isEditModeRef.value) {
          await store.updatePlan(props.form.id, payload);
          Swal.fire("Success", "Plan updated successfully", "success");
        } else {
          await store.createPlan(payload);
          Swal.fire("Success", "Plan created successfully", "success");
        }
        closeModal();
        await store.fetchPlans();
      } catch (err) {
        console.error("Submit error:", err);
        errorMessage.value = err.response?.data?.message || "Failed to submit plan";
        Swal.fire("Error", errorMessage.value, "error");
      } finally {
        loading.value = false;
      }
    };

    return { localForm, submit, loading, isEditModeRef, errorMessage, closeModal };
  },
};
</script>
