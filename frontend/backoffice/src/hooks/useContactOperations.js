import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useContactOperations() {
  const axios = useAxiosClient();
  const apiUrl = "/api/contacts";

  // Paginated: page (0-based) and size
  const getAllContacts = useCallback(
    async (page = 0, size = 20, options = {}) => {
      const config = {};
      if (options.signal) config.signal = options.signal;
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));
      if (options.search) params.set("search", options.search);
      if (options.sortField) {
        params.set("sortField", options.sortField);
        if (options.sortDir) params.set("sortDir", options.sortDir);
      }
      if (options.filter) params.set("filter", options.filter);
      const url = `${apiUrl}?${params.toString()}`;
      const res = await axios.get(url, config);
      return res.data;
    },
    [axios],
  );

  const getContactById = useCallback(
    async (id) => {
      const res = await axios.get(`${apiUrl}/${id}`);
      return res.data;
    },
    [axios],
  );

  const markContactAsRead = useCallback(
    async (id, isRead) => {
      const res = await axios.put(`${apiUrl}/${id}/read?isRead=${isRead}`);
      return res.data;
    },
    [axios],
  );

  const deleteContact = useCallback(
    async (id) => {
      const res = await axios.delete(`${apiUrl}/${id}`);
      return res.data;
    },
    [axios],
  );

  const linkContactToUser = useCallback(
    async (contactId, userId) => {
      const res = await axios.put(`${apiUrl}/${contactId}/link/${userId}`);
      return res.data;
    },
    [axios],
  );

  const unlinkContactFromUser = useCallback(
    async (contactId) => {
      const res = await axios.put(`${apiUrl}/${contactId}/unlink`);
      return res.data;
    },
    [axios],
  );

  const getUnlinkedContacts = useCallback(
    async (page = 0, size = 20) => {
      const res = await axios.get(
        `${apiUrl}/unlinked?page=${page}&size=${size}`,
      );
      return res.data;
    },
    [axios],
  );

  const getContactsByEmail = useCallback(
    async (email, page = 0, size = 20) => {
      const res = await axios.get(
        `${apiUrl}/search/email?email=${encodeURIComponent(email)}&page=${page}&size=${size}`,
      );
      return res.data;
    },
    [axios],
  );

  const getContactsByDateRange = useCallback(
    async (startDate, endDate, page = 0, size = 20) => {
      const params = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&page=${page}&size=${size}`;
      const res = await axios.get(`${apiUrl}/date-range${params}`);
      return res.data;
    },
    [axios],
  );

  return {
    getAllContacts,
    getContactById,
    markContactAsRead,
    deleteContact,
    linkContactToUser,
    unlinkContactFromUser,
    getUnlinkedContacts,
    getContactsByEmail,
    getContactsByDateRange,
  };
}
