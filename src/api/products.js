import axios from "axios";
import { API_ENDPOINTS } from "./constants";

export function getProducts(token) {
  return axios.get(API_ENDPOINTS.PRODUCTS, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createProduct(data, token) {
  return axios.post(API_ENDPOINTS.PRODUCTS, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateProduct(id, data, token) {
  return axios.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteProduct(id, token) {
  return axios.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
