import axios from "axios";
import { API_ENDPOINTS } from "./constants";

export const login = (email, password) => {
  return axios.post(API_ENDPOINTS.LOGIN, { email, password });
};

export const logout = (token) => {
  return axios.post(
    API_ENDPOINTS.LOGOUT,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

