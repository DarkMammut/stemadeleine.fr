import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function usePaymentOperations() {
  const axios = useAxiosClient();
  const apiUrl = "/api/payments";

  const getAllPayments = useCallback(async () => {
    const res = await axios.get(apiUrl);
    return res.data;
  }, [axios]);

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

  return { getAllPayments, createPayment, deletePayment };
}
