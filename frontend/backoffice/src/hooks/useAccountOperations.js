import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export const useAccountOperations = () => {
  const axios = useAxiosClient();

  const getAccountsByUserId = useCallback(
    async (userId) => {
      try {
        const res = await axios.get(`/api/accounts`, { params: { userId } });
        return res.data;
      } catch (err) {
        console.error("Error fetching accounts for user:", err);
        throw err;
      }
    },
    [axios],
  );

  const getAllAccounts = useCallback(async () => {
    try {
      const res = await axios.get(`/api/accounts`);
      return res.data;
    } catch (err) {
      console.error("Error fetching all accounts:", err);
      throw err;
    }
  }, [axios]);

  const getAccountById = useCallback(
    async (id) => {
      try {
        const res = await axios.get(`/api/accounts/${id}`);
        return res.data;
      } catch (err) {
        console.error(`Error fetching account ${id}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const createAccount = useCallback(
    async (data) => {
      try {
        const res = await axios.post(`/api/accounts`, data);
        return res.data;
      } catch (err) {
        console.error("Error creating account:", err);
        throw err;
      }
    },
    [axios],
  );

  const updateAccount = useCallback(
    async (id, data) => {
      try {
        const res = await axios.put(`/api/accounts/${id}`, data);
        return res.data;
      } catch (err) {
        console.error(`Error updating account ${id}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const deleteAccount = useCallback(
    async (id) => {
      try {
        const res = await axios.delete(`/api/accounts/${id}`);
        return res.data;
      } catch (err) {
        console.error(`Error deleting account ${id}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const changePassword = useCallback(
    async (id, { currentPassword, newPassword }) => {
      try {
        const payload = { currentPassword, newPassword };
        const res = await axios.put(`/api/accounts/${id}/password`, payload);
        return res.data;
      } catch (err) {
        console.error(`Error changing password for account ${id}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const attachUser = useCallback(
    async (accountId, userId) => {
      try {
        const res = await axios.put(`/api/accounts/${accountId}/user`, {
          userId,
        });
        return res.data;
      } catch (err) {
        console.error(
          `Error attaching user ${userId} to account ${accountId}:`,
          err,
        );
        throw err;
      }
    },
    [axios],
  );

  const detachUser = useCallback(
    async (accountId) => {
      try {
        const res = await axios.put(`/api/accounts/${accountId}/user`, {
          userId: null,
        });
        return res.data;
      } catch (err) {
        console.error(`Error detaching user from account ${accountId}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const setActive = useCallback(
    async (accountId, isActive) => {
      try {
        const res = await axios.put(`/api/accounts/${accountId}/active`, {
          isActive,
        });
        return res.data;
      } catch (err) {
        console.error(
          `Error setting active=${isActive} for account ${accountId}:`,
          err,
        );
        throw err;
      }
    },
    [axios],
  );

  return {
    getAccountsByUserId,
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    changePassword,
    attachUser,
    detachUser,
    setActive,
  };
};
