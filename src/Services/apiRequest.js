import axios from "axios";
import alert from "./SweetAlert";

// Axios instance
const api = axios.create({
  baseURL: "http://admin-octanefitcity.site/api", // 🔁 change to your backend URL
  // ❌ Removed the hardcoded "Content-Type" here
});

// ✅ ADDED: Interceptor to dynamically set headers based on the payload type
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Axios will automatically attach the correct boundary string for file uploads
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    // Default back to JSON for all other standard requests
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// 🔐 Helper to attach token if needed
const attachAuthHeader = (isAuth) => {
  if (!isAuth) return {};

  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

// 🎯 Main API Object
const apiRequest = {

  get: async (endpoint, isAuth = false) => {
    try {
      const response = await api.get(endpoint, {
        headers: attachAuthHeader(isAuth),
      });
      return response.data;
    } catch (error) {
      alert.error(error?.response?.data.result || error.message);
      throw error?.response?.data || error;
    }
  },

  post: async (endpoint, payload, isAuth = false) => {
    try {
      const response = await api.post(endpoint, payload, {
        headers: attachAuthHeader(isAuth),
      });
      return response.data;
    } catch (error) {
      alert.error(error?.response?.data.result || error.message);
      throw error?.response?.data || error;
    }
  },

  put: async (endpoint, payload, isAuth = false) => {
    try {
      const response = await api.put(endpoint, payload, {
        headers: attachAuthHeader(isAuth),
      });
      return response.data;
    }
    catch (error) {
      alert.error(error?.response?.data.result || error.message);
      throw error?.response?.data || error;
    }
  },

  patch: async (endpoint, payload, isAuth = false) => {
    try {
      const response = await api.patch(endpoint, payload, {
        headers: attachAuthHeader(isAuth),
      });
      return response.data;
    } catch (error) {
      alert.error(error?.response?.data.result || error.message);
      throw error?.response?.data || error;
    }
  },

  delete: async (endpoint, isAuth = false) => {
    try {
      const response = await api.delete(endpoint, {
        headers: attachAuthHeader(isAuth),
      });
      return response.data;
    } catch (error) {
      alert.error(error?.response?.data.result || error.message);
      throw error?.response?.data || error;
    }
  },
};

export default apiRequest;