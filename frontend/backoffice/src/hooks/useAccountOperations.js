import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export const useAccountOperations = () => {
  const axios = useAxiosClient();

  const getAccounts = useCallback(
    async (page = 0, size = 10, options = {}) => {
      try {
        // build params map similar to other hooks (payments/users)
        const params = {};
        if (typeof page === "number") params.page = page;
        if (typeof size === "number") params.size = size;
        if (options.search) params.search = options.search;
        if (options.sortField) params.sortField = options.sortField;
        if (options.sortDir) params.sortDir = options.sortDir;
        // allow arbitrary filters like role, provider or multi-values (arrays)
        if (options.role) params.role = options.role;
        if (options.provider) params.provider = options.provider;
        if (options.statuses && Array.isArray(options.statuses)) {
          options.statuses.forEach((s) => {
            // axios will serialize duplicate keys when using params with array
            if (!params.status) params.status = [];
            params.status.push(s);
          });
        }

        const config = { params };
        if (options.signal) config.signal = options.signal;

        const res = await axios.get(`/api/accounts`, config);
        return res.data;
      } catch (err) {
        // Don't log cancellation errors (they are expected when aborting requests)
        if (
          err &&
          (err.code === "ERR_CANCELED" ||
            err.name === "CanceledError" ||
            err.message === "canceled")
        ) {
          // return null on cancellation to avoid throwing and noisy console errors
          return null;
        }
        console.error("Error fetching accounts (paged):", err);
        throw err;
      }
    },
    [axios],
  );

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
    // new paged API
    getAccounts,
    // legacy / existing API
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
