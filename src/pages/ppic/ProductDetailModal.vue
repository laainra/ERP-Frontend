<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header">
          <h5 class="modal-title">Product Detail - {{ product.name }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <table class="table table-borderless">
            <tr><th>SKU</th><td>{{ product.sku }}</td></tr>
            <tr><th>Name</th><td>{{ product.name }}</td></tr>
            <tr><th>Description</th><td>{{ product.description }}</td></tr>
            <tr><th>Unit</th><td>{{ product.unit }}</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductDetailModal",
  props: ["show", "product"]
};
</script>
