import axios from "axios";
import { CATEGORY_URL, SUBCATEGORY_URL } from "../config/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Turn an axios error into the server's message ("A sub-category with this name already exists…")
export const apiErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

/**
 * Category tree with product counts.
 * includeInactive=false (browsing) hides inactive categories / sub-categories and everything under them.
 */
export const getCategoryTree = async (includeInactive = false) => {
  const response = await axios.get(`${CATEGORY_URL}/tree`, {
    params: { includeInactive: includeInactive ? "true" : "false" },
  });
  return response.data.data || [];
};

export const createCategory = async (data) =>
  (await axios.post(`${CATEGORY_URL}/new`, data, authHeaders())).data.data;

export const updateCategory = async (id, data) =>
  (await axios.put(`${CATEGORY_URL}/${id}`, data, authHeaders())).data.data;

export const deleteCategory = async (id) =>
  (await axios.delete(`${CATEGORY_URL}/${id}`, authHeaders())).data;

// parent: sub-category id, or null for a top-level sub-category of the category
export const createSubCategory = async ({ name, category, parent = null, isActive = true }) =>
  (await axios.post(`${SUBCATEGORY_URL}/new`, { name, category, parent, isActive }, authHeaders())).data.data;

// data may include { name, isActive, parent } — changing parent moves the node
export const updateSubCategory = async (id, data) =>
  (await axios.put(`${SUBCATEGORY_URL}/${id}`, data, authHeaders())).data.data;

export const deleteSubCategory = async (id) =>
  (await axios.delete(`${SUBCATEGORY_URL}/${id}`, authHeaders())).data;
