import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useUserOperations() {
  const axios = useAxiosClient();
  const apiUrl = "/api/users";

  const getCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/me`);
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // 401 est déjà géré par ton interceptor, donc on peut renvoyer null
        return null;
      }
      console.error(
        "Erreur lors du chargement de l'utilisateur actuel :",
        error,
      );
      throw error;
    }
  }, [axios]);

  // now pageable: page (0-based) and size
  const getAllUsers = useCallback(
    async (adherentsOnly = false, page = 0, size = 20) => {
      const urlBase = adherentsOnly ? `${apiUrl}/adherents` : apiUrl;
      const params = `?page=${page}&size=${size}`;
      const res = await axios.get(`${urlBase}${params}`);
      // expecting a Page<T> structure from backend: { content: [...], totalElements, totalPages, number, size }
      return res.data;
    },
    [axios],
  );

  const createUser = useCallback(
    async (user) => {
      const res = await axios.post(apiUrl, user);
      return res.data;
    },
    [axios],
  );

  // Normalize user payloads before sending to API (avoid empty string for date fields)
  const normalizeUserPayload = (user) => {
    if (!user || typeof user !== "object") return user;
    const copy = { ...user };
    if (Object.prototype.hasOwnProperty.call(copy, "birthDate")) {
      if (copy.birthDate === "" || copy.birthDate == null) {
        copy.birthDate = null;
      }
    }
    return copy;
  };

  const updateUser = useCallback(
    async (id, user) => {
      const payload = normalizeUserPayload(user);
      const res = await axios.put(`${apiUrl}/${id}`, payload);
      return res.data;
    },
    [axios],
  );

  const updateCurrentUser = useCallback(
    async (user) => {
      const payload = normalizeUserPayload(user);
      const res = await axios.put(`${apiUrl}/me`, payload);
      return res.data;
    },
    [axios],
  );

  const updateUserVisibility = useCallback(
    async (id, visible) => {
      const res = await axios.patch(`${apiUrl}/${id}/visibility`, { visible });
      return res.data;
    },
    [axios],
  );

  const deleteUser = useCallback(
    async (id) => {
      const res = await axios.delete(`${apiUrl}/${id}`);
      return res.data;
    },
    [axios],
  );

  return {
    getCurrentUser,
    getAllUsers,
    createUser,
    updateUser,
    updateCurrentUser,
    updateUserVisibility,
    deleteUser,
  };
}
