import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useContactOperations() {
  const axios = useAxiosClient();
  const apiUrl = "/api/contacts";

  const getAllContacts = useCallback(async () => {
    const res = await axios.get(apiUrl);
    return res.data;
  }, [axios]);

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

  return {
    getAllContacts,
    getContactById,
    markContactAsRead,
    deleteContact,
    linkContactToUser,
    unlinkContactFromUser,
  };
}
