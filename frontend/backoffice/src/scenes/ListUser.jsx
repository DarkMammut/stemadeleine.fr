import { useEffect, useMemo, useState } from "react";

const allColumns = [
  { key: "id", label: "ID" },
  { key: "lastname", label: "Nom" },
  { key: "firstname", label: "Prénom" },
  { key: "email", label: "Email" },
  { key: "membershipStatus", label: "Statut adhésion" },
  { key: "membershipStartDate", label: "Date d'adhésion" },
];

function getMembershipField(user, field) {
  if (!user.memberships || user.memberships.length === 0) return "-";
  // On prend le premier membership actif, sinon le premier tout court
  const active = user.memberships.find((m) => m.active === true);
  const m = active || user.memberships[0];
  if (field === "membershipStatus") return m.active ? "active" : "inactive";
  if (field === "membershipStartDate") return m.dateAdhesion || "-";
  return "-";
}

function getUserName(user) {
  return [user.firstname, user.lastname].filter(Boolean).join(" ") || "-";
}

export default function ListUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.map((c) => c.key),
  );
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState({ key: "id", asc: true });

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/users")
      .then((res) => {
        if (!res.ok)
          throw new Error("Erreur lors du chargement des utilisateurs");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filtrage et tri
  const filteredUsers = useMemo(() => {
    let data = users;
    if (filter) {
      data = data.filter(
        (u) =>
          getUserName(u).toLowerCase().includes(filter.toLowerCase()) ||
          u.email?.toLowerCase().includes(filter.toLowerCase()) ||
          (u.memberships &&
            u.memberships.some(
              (m) =>
                (m.active ? "active" : "inactive").includes(
                  filter.toLowerCase(),
                ) ||
                (m.dateAdhesion || "")
                  .toLowerCase()
                  .includes(filter.toLowerCase()),
            )),
      );
    }
    data = [...data].sort((a, b) => {
      let aValue, bValue;
      if (["membershipStatus", "membershipStartDate"].includes(sort.key)) {
        aValue = getMembershipField(a, sort.key);
        bValue = getMembershipField(b, sort.key);
      } else if (sort.key === "name") {
        aValue = getUserName(a);
        bValue = getUserName(b);
      } else {
        aValue = a[sort.key];
        bValue = b[sort.key];
      }
      if (aValue < bValue) return sort.asc ? -1 : 1;
      if (aValue > bValue) return sort.asc ? 1 : -1;
      return 0;
    });
    return data;
  }, [users, filter, sort]);

  // Gestion export CSV
  const handleExportCSV = () => {
    const header = visibleColumns
      .map((key) => allColumns.find((c) => c.key === key).label)
      .join(",");
    const rows = filteredUsers
      .map((u) =>
        visibleColumns
          .map((key) => {
            if (["membershipStatus", "membershipStartDate"].includes(key)) {
              return getMembershipField(u, key);
            }
            if (key === "name") {
              return getUserName(u);
            }
            return u[key];
          })
          .join(","),
      )
      .join("\n");
    const csv = header + "\n" + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Impression
  const handlePrint = () => {
    window.print();
  };

  // Gestion des colonnes visibles
  const toggleColumn = (key) => {
    setVisibleColumns((cols) =>
      cols.includes(key) ? cols.filter((c) => c !== key) : [...cols, key],
    );
  };

  // Gestion du tri
  const handleSort = (key) => {
    setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Liste des utilisateurs</h2>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          <div className="mb-2 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Filtrer par nom, email ou adhésion"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={handleExportCSV}
              className="border px-2 py-1 rounded bg-blue-100"
            >
              Exporter CSV
            </button>
            <button
              onClick={handlePrint}
              className="border px-2 py-1 rounded bg-green-100"
            >
              Imprimer
            </button>
            <div className="flex gap-2 ml-4">
              {allColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </div>
          <table className="w-full border mt-2">
            <thead>
              <tr>
                {allColumns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer border px-2 py-1 bg-gray-100"
                    >
                      {col.label}{" "}
                      {sort.key === col.key ? (sort.asc ? "▲" : "▼") : ""}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  {visibleColumns.map((key) => (
                    <td key={key} className="border px-2 py-1">
                      {["membershipStatus", "membershipStartDate"].includes(key)
                        ? getMembershipField(u, key)
                        : key === "name"
                          ? getUserName(u)
                          : u[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
