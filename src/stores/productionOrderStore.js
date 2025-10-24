// src/stores/orderStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/constants";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [],
    orderLogs: {}, 
    pagination: {
      perPage: 10,
      currentPage: 1,
      lastPage: 1,
      total: 0,
    },
  }),

  actions: {
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem("token")}` };
    },

  async fetchOrders(params) {
    const { data } = await axios.get(API_ENDPOINTS.PRODUCTION_ORDERS, {
      params,
      headers: this.getAuthHeaders(),
    });
    this.orders = data.data;
    this.pagination = {
      page: data.current_page,
      lastPage: data.last_page,
      perPage: data.per_page,
      total: data.total,
    };
  },
    // fetch single order
    async fetchOrder(id) {
      try {
        const res = await axios.get(`${API_ENDPOINTS.PRODUCTION_ORDERS}/${id}`, {
          headers: this.getAuthHeaders(),
        });
        return res.data.data;
      } catch (err) {
        console.error("Failed to fetch order:", err.response?.data || err);
      }
    },

    // create new order
    async createOrder(payload) {
      try {
        const res = await axios.post(API_ENDPOINTS.PRODUCTION_ORDERS, payload, {
          headers: this.getAuthHeaders(),
        });
        this.orders.push(res.data.data);
        return res.data.data;
      } catch (err) {
        console.error("Failed to create order:", err.response?.data || err);
        throw err;
      }
    },

    // update order
    async updateOrder(id, payload) {
      try {
        const res = await axios.put(`${API_ENDPOINTS.PRODUCTION_ORDERS}/${id}`, payload, {
          headers: this.getAuthHeaders(),
        });
        const index = this.orders.findIndex((o) => o.id === id);
        if (index !== -1) this.orders[index] = res.data.data;
        return res.data.data;
      } catch (err) {
        console.error("Failed to update order:", err.response?.data || err);
        throw err;
      }
    },

    // delete order
    async deleteOrder(id) {
      try {
        await axios.delete(`${API_ENDPOINTS.PRODUCTION_ORDERS}/${id}`, {
          headers: this.getAuthHeaders(),
        });
        this.orders = this.orders.filter((o) => o.id !== id);
      } catch (err) {
        console.error("Failed to delete order:", err.response?.data || err);
        throw err;
      }
    },

    // update status
    async updateStatus(id, payload) {
      try {
        const res = await axios.put(`${API_ENDPOINTS.PRODUCTION_ORDERS}/${id}/status`, payload, {
          headers: this.getAuthHeaders(),
        });
        const index = this.orders.findIndex((o) => o.id === id);
        if (index !== -1) this.orders[index] = res.data.data;
        return res.data.data;
      } catch (err) {
        console.error("Failed to update status:", err.response?.data || err);
        throw err;
      }
    },

    // fetch logs
    async fetchLogs(id) {
      try {
        const res = await axios.get(`${API_ENDPOINTS.PRODUCTION_ORDERS}/${id}/logs`, {
          headers: this.getAuthHeaders(),
        });
        this.orderLogs[id] = res.data || [];
        return this.orderLogs[id];
      } catch (err) {
        console.error("Failed to fetch order logs:", err.response?.data || err);
        throw err;
      }
    },
    
    async fetchOrdersByPlan(plan_id) {
    try {
      const res = await axios.get(API_ENDPOINTS.PRODUCTION_ORDERS, {
        params: { plan_id },
        headers: this.getAuthHeaders(),
      });
      return res.data.data || [];
    } catch (err) {
      console.error("Failed to fetch orders by plan:", err.response?.data || err);
      return [];
    }
  },
    async hasOrder(id) {
      try {
        const res = await axios.get(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}/has-orders`, {
          headers: this.getAuthHeaders(),
        });
        return res.data; 
      } catch (err) {
        console.error("Failed to check orders by plan:", err.response?.data || err);
        return { has_orders: false, order_count: 0 };
      }
    }

  },
} );
