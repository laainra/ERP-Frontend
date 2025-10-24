import axios from "axios";
import { API_ENDPOINTS } from "./constants";

export function getPlans(token) {
  return axios.get(API_ENDPOINTS.PRODUCTION_PLANS, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createPlan(data, token) {
  return axios.post(API_ENDPOINTS.PRODUCTION_PLANS, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updatePlan(id, data, token) {
  return axios.put(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deletePlan(id, token) {
  return axios.delete(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function approvePlan(id, token) {
  return axios.put(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function rejectPlan(id, reason, token) {
  return axios.put(`${API_ENDPOINTS.PRODUCTION_PLANS}/${id}/reject`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

