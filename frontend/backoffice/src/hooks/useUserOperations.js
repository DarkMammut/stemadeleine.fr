import { useCallback } from "react";

export function useUserOperations() {
  const apiUrl = "/api/users";

  const getAllUsers = useCallback(async (adherentsOnly = false) => {
    const url = adherentsOnly ? `${apiUrl}/adherents` : apiUrl;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
    return await res.json();
  }, []);

  const createUser = useCallback(async (user) => {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("Erreur lors de la création de l'utilisateur");
    return await res.json();
  }, []);

  const updateUserVisibility = useCallback(async (id, visible) => {
    const res = await fetch(`${apiUrl}/${id}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
    if (!res.ok)
      throw new Error("Erreur lors de la mise à jour de la visibilité");
    return await res.json();
  }, []);

  const deleteUser = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    if (!res.ok)
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    return await res.json();
  }, []);

  return { getAllUsers, createUser, updateUserVisibility, deleteUser };
}
