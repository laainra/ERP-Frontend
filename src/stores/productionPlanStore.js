import { defineStore } from "pinia";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/constants";

export const useProductionPlanStore = defineStore("productionPlan", {
  state: () => ({
    plans: [],
    reports: [],
    search: "",
    sortField: "plan_code",
    sortOrder: "asc",
    pagination: {
      page: 1,
      perPage: 10,
      total: 0,
      lastPage: 1,
    },
    role: localStorage.getItem("role") || "user",
  }),
  actions: {
    async fetchPlans() {
      this.loading = true;
      try {
        const res = await axios.get(API_ENDPOINTS.PRODUCTION_PLANS, {
          params: {
            page: this.pagination.page,
            per_page: this.pagination.perPage,
            search: this.search,
            sort_field: this.sortField,
            sort_order: this.sortOrder,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.plans = res.data.data;
        this.pagination.total = res.data.total;
        this.pagination.lastPage = res.data.last_page;
        return res.data; 
      } finally {
        this.loading = false;
      }
    },
    async createPlan(plan) {
      const token = localStorage.getItem("token");
      await axios.post(API_ENDPOINTS.PRODUCTION_PLANS, plan, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async getPlan(id) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // pastikan data dikembalikan
      } catch (err) {
        console.error("Failed to fetch plan:", err);
        throw err; // biar bisa di-handle di openOrderDetail
      }
    },
    async updatePlan(id, plan) {
      const token = localStorage.getItem("token");
      await axios.put(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}`, plan, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async deletePlan(id) {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async approvePlan(id) {
      const token = localStorage.getItem("token");
      await axios.put(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async rejectPlan(id, reason = "") {
      const token = localStorage.getItem("token");
      await axios.put(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async fetchPlanReports(params = {}) {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_ENDPOINTS.PRODUCTION_PLANS}/report`, {
        headers: { Authorization: `Bearer ${token}` },
        params, 
      });

      this.reports = data.data;
    }

  },
});
