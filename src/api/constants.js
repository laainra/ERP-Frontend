// src/api/constants.js
const API_BASE_URL = "http://localhost:8000/api"; 

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  LOGOUT: `${API_BASE_URL}/logout`,
  USERS: `${API_BASE_URL}/users`,
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCTION_PLANS: `${API_BASE_URL}/production_plans`,
  PRODUCTION_PLAN_REPORT: `${API_BASE_URL}/production_plans/report`,
  PRODUCTION_ORDERS: `${API_BASE_URL}/production_orders`,
  REPORTS: `${API_BASE_URL}/reports`,
};

export default API_BASE_URL;
