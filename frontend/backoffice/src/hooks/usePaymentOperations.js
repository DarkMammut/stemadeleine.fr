import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function usePaymentOperations() {
  const axios = useAxiosClient();
  const apiUrl = "/api/payments";

  // Now paginated: page (0-based) and size
  const getAllPayments = useCallback(
    async (page = 0, size = 20, options = {}) => {
      const { sortField, sortDir, statuses, types, signal } = options || {};
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("size", size);
      if (options.search) params.set("search", options.search);
      if (sortField) params.set("sortField", sortField);
      if (sortDir) params.set("sortDir", sortDir);
      // append multi params for status and type
      if (statuses && Array.isArray(statuses)) {
        statuses.forEach((s) => {
          if (s != null) params.append("status", s);
        });
      }
      if (types && Array.isArray(types)) {
        types.forEach((t) => {
          if (t != null) params.append("type", t);
        });
      }

      const config = {};
      if (signal) config.signal = signal;

      const res = await axios.get(`${apiUrl}?${params.toString()}`, config);
      return res.data; // expecting Page<Payment>
    },
    [axios],
  );

  const createPayment = useCallback(
    async (payment) => {
      const res = await axios.post(apiUrl, payment);
      return res.data;
    },
    [axios],
  );

  const deletePayment = useCallback(
    async (id) => {
      const res = await axios.delete(`${apiUrl}/${id}`);
      return res.data;
    },
    [axios],
  );

  // Attacher un user à un paiement via une route dédiée
  const attachUser = useCallback(
    async (paymentId, userId) => {
      // convention: PUT /api/payments/:id/user { userId }
      const res = await axios.put(`${apiUrl}/${paymentId}/user`, { userId });
      return res.data;
    },
    [axios],
  );

  // Détacher le user d'un paiement
  const detachUser = useCallback(
    async (paymentId) => {
      const res = await axios.put(`${apiUrl}/${paymentId}/user`, {
        userId: null,
      });
      return res.data;
    },
    [axios],
  );

  return {
    getAllPayments,
    createPayment,
    deletePayment,
    attachUser,
    detachUser,
  };
}
