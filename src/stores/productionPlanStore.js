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
    async fetchPlans(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get(API_ENDPOINTS.PRODUCTION_PLANS, {
          params: {
            page: params.page || this.pagination.page,
            per_page: params.perPage || this.pagination.perPage,
            search: params.search || this.search,
            sort_field: params.sortField || this.sortField,
            sort_order: params.sortOrder || this.sortOrder,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // simpan data ke state
        this.plans = res.data.data;
        this.pagination.page = res.data.current_page;
        this.pagination.perPage = res.data.per_page;
        this.pagination.total = res.data.total;
        this.pagination.lastPage = res.data.last_page;

        return res.data; // kembalikan semua info pagination + data
      } finally {
        this.loading = false;
      }
    },

    async createPlan(plan) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.post(API_ENDPOINTS.PRODUCTION_PLANS, plan, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Plan created:", res.data);
      } catch (err) {
        if (err.response) {
          console.error("Validation errors:", err.response.data);
        } else {
          console.error(err);
        }
      }
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
      try {
        const response = await axios.put(
          `${API_ENDPOINTS.PRODUCTION_PLANS}/${id}/approve`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // bisa return response.data supaya caller bisa pakai
        return response.data;
      } catch (err) {
        console.error("Approve failed in store:", err);

        // Ambil pesan error dari response Laravel
        let message = "Failed to approve plan";
        if (err?.response?.data) {
          if (typeof err.response.data.message === "string") {
            message = err.response.data.message;
          } else if (Array.isArray(err.response.data.message)) {
            message = err.response.data.message.join(", ");
          } else if (typeof err.response.data.message === "object") {
            message = JSON.stringify(err.response.data.message);
          }
        }

        // lempar lagi supaya caller bisa handle Swal
        throw new Error(message);
      }
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
