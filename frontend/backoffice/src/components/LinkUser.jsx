import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAxiosClient } from "@/utils/axiosClient";

export default function LinkUser({ onLink, onCreateAndLink, loading }) {
  const axios = useAxiosClient();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [creatingLoading, setCreatingLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setUsers([]);
      return;
    }
    let active = true;
    axios.get(`/api/users?search=${search}`).then((res) => {
      if (active) setUsers(res.data);
    });
    return () => {
      active = false;
    };
  }, [search, axios]);

  const handleLink = () => {
    if (selectedUserId) onLink(selectedUserId);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreatingLoading(true);
    try {
      const res = await axios.post("/api/users", newUser);
      onCreateAndLink(res.data.id);
      setCreating(false);
      setNewUser({ firstname: "", lastname: "", email: "" });
    } catch (err) {
      alert("Erreur lors de la création de l'utilisateur");
    } finally {
      setCreatingLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!creating ? (
        <div>
          <label className="block mb-2 font-medium">
            Rechercher un utilisateur
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, prénom ou email..."
            className="border rounded px-3 py-2 w-full mb-2"
          />
          {users.length > 0 && (
            <select
              className="border rounded px-3 py-2 w-full mb-2"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstname} {u.lastname} ({u.email})
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <Button onClick={handleLink} disabled={!selectedUserId || loading}>
              Lier l'utilisateur sélectionné
            </Button>
            <Button variant="secondary" onClick={() => setCreating(true)}>
              Créer et lier un nouvel utilisateur
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-2">
          <label className="block font-medium">Prénom</label>
          <input
            type="text"
            value={newUser.firstname}
            onChange={(e) =>
              setNewUser({ ...newUser, firstname: e.target.value })
            }
            required
            className="border rounded px-3 py-2 w-full"
          />
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            value={newUser.lastname}
            onChange={(e) =>
              setNewUser({ ...newUser, lastname: e.target.value })
            }
            required
            className="border rounded px-3 py-2 w-full"
          />
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            className="border rounded px-3 py-2 w-full"
          />
          <div className="flex gap-2 mt-2">
            <Button type="submit" loading={creatingLoading}>
              Créer et lier
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCreating(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
