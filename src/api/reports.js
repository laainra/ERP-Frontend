import axios from "axios";
import { API_ENDPOINTS } from "./constants";

export function getReports(token, params = {}) {
  return axios.get(API_ENDPOINTS.REPORTS, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getReportById(token, id) {
  return axios.get(`${API_ENDPOINTS.REPORTS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createReport(token, data) {
  return axios.post(API_ENDPOINTS.REPORTS, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateReport(token, id, data) {
  return axios.put(`${API_ENDPOINTS.REPORTS}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteReport(token, id) {
  return axios.delete(`${API_ENDPOINTS.REPORTS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function exportReports(token) {
  return axios.get(`${API_ENDPOINTS.REPORTS}/export`, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });
}
