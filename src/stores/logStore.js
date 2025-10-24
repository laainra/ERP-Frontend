import { defineStore } from "pinia";
import axios from "axios";
import { API_ENDPOINTS } from "../api/constants";

export const useLogStore = defineStore("logStore", {
  state: () => ({
    logs: { data: [] },
    pagination: {
      page: 1,
      perPage: 10,
      lastPage: 1,
    },
    search: "",
    sortField: "changed_at",
    sortOrder: "desc",
  }),
  actions: {
    async fetchLogs() {
      const res = await axios.get(API_ENDPOINTS.LOGS, {
        params: {
          page: this.pagination.page,
          perPage: this.pagination.perPage,
          search: this.search,
          sortField: this.sortField,
          sortOrder: this.sortOrder,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.logs = res.data;
      this.pagination.lastPage = res.data.last_page;
    },
    setPage(page) {
      this.pagination.page = page;
      this.fetchLogs();
    },
    setPerPage(perPage) {
      this.pagination.perPage = perPage;
      this.pagination.page = 1;
      this.fetchLogs();
    },
    setSearch(search) {
      this.search = search;
      this.pagination.page = 1;
      this.fetchLogs();
    },
    setSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortOrder = "asc";
      }
      this.fetchLogs();
    },
  },
});
