
import { defineStore } from "pinia";
import axios from "axios";
import { API_ENDPOINTS } from "../api/constants";

export const useProductStore = defineStore("product", {
  state: () => ({
    products: [],
    pagination: {
      page: 1,
      perPage: 10,
      total: 0,
      lastPage: 1,
    },
    search: "",
    sortField: "id",
    sortOrder: "desc",
    loading: false,
  }),
  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get(API_ENDPOINTS.PRODUCTS, {
          params: {
            page: this.pagination.page,
            per_page: this.pagination.perPage,
            search: this.search,
            sort_field: this.sortField,
            sort_order: this.sortOrder,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.products = res.data.data;
        this.pagination.total = res.data.total;
        this.pagination.lastPage = res.data.last_page;
      } finally {
        this.loading = false;
      }
    },
    async createProduct(payload) {
      await axios.post(API_ENDPOINTS.PRODUCTS, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.fetchProducts();
    },
    async updateProduct(id, payload) {
      await axios.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.fetchProducts();
    },
    async deleteProduct(id) {
      await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.fetchProducts();
    },
async getProduct(id) {
  try {
    console.log('Fetching product with ID:', id); // Log the ID being fetched
    
    const res = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    console.log('Raw API Response:', res); // Log full response
    console.log('Response data:', res.data); // Log response data
    console.log('Product data:', res.data.data); // Log actual product data
    
    if (!res.data.data) {
      console.error('No product data found in response');
      throw new Error('Product data not found');
    }
    
    return res.data.data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

  },
});
