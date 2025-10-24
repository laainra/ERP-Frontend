import axios from "axios";
import { API_ENDPOINTS } from "./constants";

export function getOrders(token) {
  return axios.get(API_ENDPOINTS.PRODUCTION_ORDERS, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createOrder(data, token) {
  return axios.post(API_ENDPOINTS.PRODUCTION_ORDERS, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
