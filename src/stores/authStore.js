import { defineStore } from "pinia";
import { login, logout } from "../api/auth";
import { API_ENDPOINTS } from "../api/constants";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    users: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(email, password) {
      const res = await login(email, password);
      this.token = res.data.token;
      this.user = res.data.user;
      this.role = res.data.user.role;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));
      localStorage.setItem("role", this.role);
    },

    async logout() {
      if (this.token) await logout(this.token);
      this.token = null;
      this.user = null;
      this.role = null;
      localStorage.clear();
    },

    async fetchUsers(role = "staff") {
      try {
        const res = await axios.get(`${API_ENDPOINTS.USERS}?role=${role}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.users = res.data.data || [];
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    },

    async getUserById(id) {
      try {
        const res = await axios.get(`${API_ENDPOINTS.USERS}/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return res.data;
      } catch (err) {
        console.error("Failed to fetch user by ID:", err);
        return null;
      }
    },
  },
});
