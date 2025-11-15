import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export const useMembershipOperations = () => {
  const axios = useAxiosClient();

  const getAllMemberships = useCallback(async () => {
    try {
      const res = await axios.get("/api/memberships");
      return res.data;
    } catch (err) {
      console.error("Error fetching all memberships:", err);
      throw err;
    }
  }, [axios]);

  const getMembershipsByUserId = useCallback(
    async (userId) => {
      try {
        // Use the shared memberships endpoint with query param for consistency
        const res = await axios.get(`/api/memberships`, { params: { userId } });
        return res.data;
      } catch (err) {
        console.error(`Error fetching memberships for user ${userId}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const getMembershipById = useCallback(
    async (id) => {
      try {
        const res = await axios.get(`/api/memberships/${id}`);
        return res.data;
      } catch (err) {
        console.error(`Error fetching membership ${id}:`, err);
        throw err;
      }
    },
    [axios],
  );

  const createMembership = useCallback(
    async (userId, data) => {
      try {
        // send userId as query param because backend expects it as request param
        const res = await axios.post(`/api/memberships`, data, {
          params: { userId },
        });
        return res.data;
      } catch (err) {
        console.error("Error creating membership:", err?.response?.status);
        throw err;
      }
    },
    [axios],
  );

  const updateMembership = useCallback(
    async (id, data) => {
      try {
        const res = await axios.put(`/api/memberships/${id}`, data);
        return res.data;
      } catch (err) {
        console.error(
          `Error updating membership ${id}:`,
          err?.response?.status,
        );
        throw err;
      }
    },
    [axios],
  );

  const deleteMembership = useCallback(
    async (id, userId) => {
      try {
        const res = await axios.delete(`/api/memberships/${id}`, {
          params: userId ? { userId } : {},
        });
        return res.data;
      } catch (err) {
        console.error(`Error deleting membership ${id}:`, err);
        throw err;
      }
    },
    [axios],
  );

  return {
    getAllMemberships,
    getMembershipsByUserId,
    getMembershipById,
    createMembership,
    updateMembership,
    deleteMembership,
  };
};
