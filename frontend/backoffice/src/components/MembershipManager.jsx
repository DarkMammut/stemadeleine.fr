import React, { useEffect, useState } from "react";
import MyForm from "@/components/ui/MyForm";
import { useNotification } from "@/hooks/useNotification";
import { useMembershipOperations } from "@/hooks/useMembershipOperations";
import PropTypes from "prop-types";
import IconButton from "@/components/ui/IconButton";
import Panel from "@/components/ui/Panel";
import {
  PlusIcon,
  UserGroupIcon as UserGroupOutlineIcon,
} from "@heroicons/react/24/outline";
import MembershipCard from "@/components/MembershipCard";

export default function MembershipManager({
  label = "Adhésions",
  memberships = [],
  userId,
  refreshMemberships,
  refreshUser,
  editable = true,
  isAdherent = false,
  loading = false,
}) {
  const membershipOps = useMembershipOperations();
  const { showSuccess, showError } = useNotification();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const addForm = { dateAdhesion: "", dateFin: "" };
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [localMemberships, setLocalMemberships] = useState(memberships || []);

  // Choose refresh function: prefer refreshMemberships, fallback to refreshUser
  const refreshFn = refreshMemberships || refreshUser;

  const loadMemberships = async () => {
    try {
      if (userId) {
        const data = await membershipOps.getMembershipsByUserId(userId);
        setLocalMemberships(data || []);
      } else {
        const data = await membershipOps.getAllMemberships();
        setLocalMemberships(data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des adhésions:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Impossible de charger les adhésions";
      showError("Erreur", apiMessage, { autoClose: false, prominent: true });
    }
  };

  useEffect(() => {
    // Load memberships on mount or when userId or memberships change, unless a refreshFn is provided externally
    if (!refreshFn) {
      loadMemberships();
    } else {
      setLocalMemberships(memberships || []);
    }
  }, [userId, refreshFn, memberships]);

  // compute headerAction after localMemberships is defined
  // (headerAction uses localMemberships)
  const isLimitReached = false; // placeholder if we later add a limit
  const headerAction =
    editable && !isLimitReached ? (
      <IconButton
        icon={PlusIcon}
        label="Ajouter"
        variant="primary"
        size="md"
        onClick={() => handleAddClick()}
        disabled={loading}
      />
    ) : null;

  // Build title node: internal icon + adherence badge if isAdherent
  const titleNode = (
    <div className="flex items-center gap-3">
      <UserGroupOutlineIcon className="w-6 h-6 text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
      {isAdherent && (
        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          Adhérent
        </span>
      )}
    </div>
  );

  const membershipFields = [
    {
      name: "dateAdhesion",
      label: "Date d'adhésion",
      type: "date",
      required: true,
    },
    {
      name: "dateFin",
      label: "Date de fin",
      type: "date",
      required: true,
    },
  ];

  // Helper: sort memberships by dateAdhesion descending (newest first)
  const sortedMemberships = (localMemberships || []).slice().sort((a, b) => {
    // Fallback to empty string if undefined
    const da = a.dateAdhesion || "";
    const db = b.dateAdhesion || "";
    // Compare as strings in ISO format or as Date
    const ta = new Date(da).getTime() || 0;
    const tb = new Date(db).getTime() || 0;
    return tb - ta;
  });

  const handleAddClick = () => {
    if (!editable) return;
    setEditingId("new");
    setEditForm({ ...addForm });
  };

  const handleEdit = (membership) => {
    if (!editable) return;
    setEditingId(membership.id);
    setEditForm({
      dateAdhesion: membership.dateAdhesion || "",
      dateFin: membership.dateFin || "",
    });
    // ensure editingId controls edit mode
  };

  // Compute whether given dates imply active membership (today inside range)
  const isActiveFromDates = (start, end) => {
    try {
      if (!start) return false;
      const [sy, sm, sd] = String(start)
        .split("-")
        .map((v) => parseInt(v, 10));
      const [ey, em, ed] = end
        ? String(end)
            .split("-")
            .map((v) => parseInt(v, 10))
        : [];
      const startDate = new Date(sy, (sm || 1) - 1, sd || 1);
      const endDate = end ? new Date(ey, (em || 1) - 1, ed || 1) : null;
      const today = new Date();
      if (endDate)
        return (
          today.getTime() >= startDate.getTime() &&
          today.getTime() <= endDate.getTime()
        );
      return today.getTime() >= startDate.getTime();
    } catch (e) {
      return false;
    }
  };

  // Wrapper for MyForm onChange to keep editForm in-sync
  const handleFormChange = (nameOrObj, value, allValues) => {
    let next = {};
    if (typeof nameOrObj === "string") {
      // called as (name, value, allValues)
      next = { ...(editForm || {}), [nameOrObj]: value };
      if (allValues && typeof allValues === "object")
        next = { ...next, ...allValues };
    } else if (typeof nameOrObj === "object") {
      next = { ...(editForm || {}), ...nameOrObj };
    }

    setEditForm(next);
  };

  const formatLocalDateToYMD = (d) => {
    if (!d) return null;
    // If it's a Date object, build local YYYY-MM-DD
    if (d instanceof Date) {
      // Use local date getters to preserve the calendar date selected by the user
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    // If it's an ISO string with time, take date part
    if (typeof d === "string") {
      // already in YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      // maybe 2025-11-13T00:00:00.000Z -> take first 10
      if (d.length >= 10) return d.slice(0, 10);
    }
    return null;
  };

  const handleEditSubmit = async (formValues) => {
    // Validate preconditions and fail loudly so caller (MyForm) doesn't show a false success
    if (!editable || !userId) {
      const reason = !editable ? "Édition non autorisée" : "userId manquant";
      showError("Erreur", `Impossible d'effectuer l'opération: ${reason}`);
      throw new Error(`MembershipManager precondition failed: ${reason}`);
    }

    setLoadingSubmit(true);
    try {
      // Normalise le payload avant envoi à l'API
      const payload = { ...formValues };

      // Dates : forcer en YYYY-MM-DD local (évite toISOString() qui produit UTC)
      if (Object.prototype.hasOwnProperty.call(payload, "dateAdhesion")) {
        payload.dateAdhesion = formatLocalDateToYMD(payload.dateAdhesion);
      }
      if (Object.prototype.hasOwnProperty.call(payload, "dateFin")) {
        payload.dateFin = formatLocalDateToYMD(payload.dateFin);
      }

      // Convertit les chaînes vides de date en null pour éviter des erreurs de parsing côté backend
      if (payload.dateAdhesion === "") payload.dateAdhesion = null;
      if (payload.dateFin === "") payload.dateFin = null;

      // Cross-field validation: end date must be >= start date
      if (payload.dateAdhesion && payload.dateFin) {
        const [sy, sm, sd] = String(payload.dateAdhesion)
          .split("-")
          .map((v) => parseInt(v, 10));
        const [ey, em, ed] = String(payload.dateFin)
          .split("-")
          .map((v) => parseInt(v, 10));
        const sdt = new Date(sy, sm - 1, sd).getTime();
        const edt = new Date(ey, em - 1, ed).getTime();
        if (edt < sdt) {
          // Create an error object carrying field-level errors so MyForm can display them inline
          const validationError = new Error(
            "La date de fin ne peut pas être antérieure à la date de début",
          );
          validationError.fieldErrors = {
            dateFin:
              "La date de fin ne peut pas être antérieure à la date de début",
          };
          // Return a rejected promise so the async caller (MyForm) can catch it and display fieldErrors
          return Promise.reject(validationError);
        }
      }

      // Determine active flag from dates instead of form
      payload.active = isActiveFromDates(payload.dateAdhesion, payload.dateFin);

      if (editingId === "new") {
        // Create new membership — use hook
        const created = await membershipOps.createMembership(userId, payload);
        showSuccess(
          "Adhésion ajoutée",
          "L'adhésion a été ajoutée avec succès",
          { autoClose: false, prominent: true },
        );
        // If no external refresh function, update local list optimistically
        if (!refreshFn && created) {
          try {
            setLocalMemberships((prev) => [created, ...(prev || [])]);
          } catch (err) {
            console.warn(
              "Impossible d'insérer localement l'adhésion créée:",
              err,
            );
          }
        }
      } else {
        // Update existing membership
        await membershipOps.updateMembership(editingId, payload);
        showSuccess(
          "Adhésion modifiée",
          "L'adhésion a été modifiée avec succès",
          { autoClose: false, prominent: true },
        );
        // If no external refresh function, reload the list to reflect updates
        if (!refreshFn) await loadMemberships();
      }

      setEditingId(null);
      // Refresh list either via provided refreshFn or local reload
      if (refreshFn) await refreshFn();
      else await loadMemberships();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (editingId === "new"
          ? "Impossible d'ajouter l'adhésion. Veuillez réessayer."
          : "Impossible de modifier l'adhésion. Veuillez réessayer.");
      showError("Erreur", apiMessage, { autoClose: false, prominent: true });
      const ex = new Error(apiMessage);
      ex.original = err;
      throw ex;
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (membershipId) => {
    if (!editable) return;
    if (!window.confirm("Voulez-vous vraiment supprimer cette adhésion ?"))
      return;
    try {
      await membershipOps.deleteMembership(membershipId);
      showSuccess(
        "Adhésion supprimée",
        "L'adhésion a été supprimée avec succès",
      );
      // Optimistically remove from local list
      setLocalMemberships((prev) =>
        (prev || []).filter((m) => m.id !== membershipId),
      );
      // Refresh list if no external refresh function
      if (!refreshFn) await loadMemberships();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Impossible de supprimer l'adhésion. Veuillez réessayer.";
      showError("Erreur", apiMessage, { autoClose: false, prominent: true });
    }
  };

  return (
    <Panel title={titleNode} actionsPrimary={headerAction}>
      {/* If adding/new membership, show the add form on top */}
      {editingId === "new" && (
        <div className="mb-4">
          <MyForm
            key="add"
            initialValues={editForm}
            fields={membershipFields}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setEditingId(null);
            }}
            submitButtonLabel="Ajouter"
            loading={loadingSubmit}
            onChange={handleFormChange}
          />
        </div>
      )}

      <div>
        {sortedMemberships.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Aucune adhésion trouvée.{" "}
            {editable && "Ajoutez une adhésion ci-dessus."}
          </div>
        )}
        <div className="space-y-3">
          {sortedMemberships.map((membership) => (
            <div key={membership.id} className="py-2">
              {editingId === membership.id ? (
                <div className="p-3 rounded-lg bg-white shadow-sm">
                  <MyForm
                    key={editingId}
                    initialValues={editForm}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingId(null)}
                    submitButtonLabel="Sauvegarder"
                    fields={membershipFields}
                    loading={loadingSubmit}
                    onChange={handleFormChange}
                  />
                </div>
              ) : (
                <MembershipCard
                  fields={membershipFields}
                  data={membership}
                  titleField="dateAdhesion"
                  onEdit={() => handleEdit(membership)}
                  onDelete={() => handleDelete(membership.id)}
                  editable={editable}
                  loading={loading}
                  columns={2}
                  gap={4}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

MembershipManager.propTypes = {
  label: PropTypes.string,
  memberships: PropTypes.array,
  userId: PropTypes.string,
  refreshMemberships: PropTypes.func,
  refreshUser: PropTypes.func,
  editable: PropTypes.bool,
  isAdherent: PropTypes.bool,
  loading: PropTypes.bool,
};
