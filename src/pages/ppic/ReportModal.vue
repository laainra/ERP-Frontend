<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header">
          <h5 class="modal-title">Buat Laporan Produksi</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="$emit('generate')">
            <!-- periodType, dates, weekly, monthly -->
            <div class="mb-3">
              <label class="form-label">Periode</label>
              <select class="form-select" v-model="localReportForm.periodType" required>
                <option value="range">Range Tanggal</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            <div v-if="reportForm.periodType === 'range'" class="mb-3">
              <label class="form-label">Dari</label>
              <input type="date" class="form-control" v-model="localReportForm.startDate" required />
              <label class="form-label mt-2">Sampai</label>
              <input type="date" class="form-control" v-model="localReportForm.endDate" required />
            </div>
            <div v-if="reportForm.periodType === 'weekly'" class="mb-3">
              <label class="form-label">Minggu Ke-</label>
              <input type="number" min="1" max="52" class="form-control" v-model="localReportForm.weekNumber" required />
              <label class="form-label mt-2">Tahun</label>
              <input type="number" min="2000" max="2100" class="form-control" v-model="localReportForm.year" required />
            </div>
            <div v-if="reportForm.periodType === 'monthly'" class="mb-3">
              <label class="form-label">Bulan</label>
              <select class="form-select" v-model="localReportForm.month" required>
                <option v-for="(m,i) in 12" :key="i" :value="i+1">{{ i+1 }}</option>
              </select>
              <label class="form-label mt-2">Tahun</label>
              <input type="number" min="2000" max="2100" class="form-control" v-model="localReportForm.year" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Informasi Tambahan</label>
              <textarea class="form-control" v-model="localReportForm.additionalInfo"></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">Cancel</button>
              <button type="submit" class="btn btn-primary">Generate & Print PDF</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "ReportModal",
  props: ["show", "reportForm"],
  setup(props, { emit }) {
    const localReportForm = ref({ ...props.reportForm });

    watch(
      () => props.reportForm,
      (newVal) => {
        localReportForm.value = { ...newVal };
      }
    );

    const generate = () => {
      emit("generate", { ...localReportForm.value });
    };

    return { localReportForm, generate };
  },
};
</script>
