import { defineStore } from "pinia";
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
} from "@/api/reports";

export const useReportStore = defineStore("reportStore", {
  state: () => ({
    reports: [],
    pagination: {
      page: 1,
      perPage: 10,
      lastPage: 1,
      total: 0,
    },
    sortField: "created_at",
    sortOrder: "desc",
    search: "",
    token: localStorage.getItem("token") || "",
  }),

  actions: {
    async fetchReports() {
      const params = {
        page: this.pagination.page,
        per_page: this.pagination.perPage,
        search: this.search,
        sort_field: this.sortField,
        sort_order: this.sortOrder,
      };

      const { data } = await getReports(this.token, params);

      this.reports = data.data;
      this.pagination.page = data.current_page;
      this.pagination.perPage = data.per_page;
      this.pagination.lastPage = data.last_page;
      this.pagination.total = data.total;
    },
    async createReport(payload) {
      await createReport(this.token, payload);
      await this.fetchReports();
    },
    async updateReport(id, payload) {
      await updateReport(this.token, id, payload);
      await this.fetchReports();
    },
    async deleteReport(id) {
      await deleteReport(this.token, id);
      await this.fetchReports();
    },
  },
});
