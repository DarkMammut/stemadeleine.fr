import React, { useEffect, useState } from "react";
import MyForm from "@/components/MyForm";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useMembershipOperations } from "@/hooks/useMembershipOperations";
import EditablePanel from "@/components/ui/EditablePanel";
import PropTypes from "prop-types";
import IconButton from "@/components/ui/IconButton";
import {
  PlusIcon,
  UserGroupIcon as UserGroupOutlineIcon,
} from "@heroicons/react/24/outline";
import ModifyButton from "@/components/ui/ModifyButton";

export default function MembershipManager({
  label = "Adhésions",
  memberships = [],
  userId,
  refreshMemberships,
  refreshUser,
  editable = true,
  isAdherent = false,
}) {
  const membershipOps = useMembershipOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [addForm] = useState({
    dateAdhesion: "",
    dateFin: "",
    autoYear: false,
  });
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
        onClick={() => {
          setAdding(true);
          setEditingId("new");
          setEditForm({ dateAdhesion: "", dateFin: "", autoYear: false });
        }}
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
      disabled: !!editForm?.autoYear,
    },
    {
      name: "dateFin",
      label: "Date de fin",
      type: "date",
      required: true,
      disabled: !!editForm?.autoYear,
    },
    // autoYear: if checked, fill the dates to start/end of the year derived from startDate (or current year)
    {
      name: "autoYear",
      label: "Remplir l'année entière",
      type: "checkbox",
      required: false,
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
    setAdding(true);
    setEditingId("new");
    setEditForm({ ...addForm });
  };

  const handleEdit = (membership) => {
    if (!editable) return;
    setEditingId(membership.id);
    setEditForm({
      dateAdhesion: membership.dateAdhesion || "",
      dateFin: membership.dateFin || "",
      autoYear: false,
    });
    setAdding(false);
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

  // Wrapper for MyForm onChange to support autoYear behaviour and to keep editForm in-sync
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

    // If autoYear toggled on, compute dates from startDate (or current year)
    if (next.autoYear) {
      // Determine base year from provided startDate or today
      const base = next.dateAdhesion || formatLocalDateToYMD(new Date());
      const year = base
        ? String(base).slice(0, 4)
        : String(new Date().getFullYear());
      next.dateAdhesion = `${year}-01-01`;
      next.dateFin = `${year}-12-31`;
    }

    setEditForm(next);
    // also update the baseline in MyForm by updating initialValues via setEditForm -> parent will pass new initialValues
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

  const formatIsoTimestampToDmy = (s) => {
    if (!s) return null;
    // s may be OffsetDateTime ISO like 2025-11-13T12:34:56Z or with offset
    if (typeof s === "string") {
      const datePart = s.slice(0, 10); // YYYY-MM-DD
      const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    }
    // fallback
    try {
      const dt = new Date(s);
      if (isNaN(dt.getTime())) return s;
      return dt.toLocaleDateString();
    } catch (e) {
      return s;
    }
  };

  const formatYmdToDmySlash = (s) => {
    if (!s) return "";
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    // fallback: replace - with /
    return String(s).replace(/-/g, "/");
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
      console.log("MembershipManager.handleEditSubmit - sending", {
        editingId,
        formValues,
      });

      // Normalise le payload avant envoi à l'API
      const payload = { ...formValues };

      // Dates : forcer en YYYY-MM-DD local (évite toISOString() qui produit UTC)
      if (Object.prototype.hasOwnProperty.call(payload, "dateAdhesion")) {
        payload.dateAdhesion = formatLocalDateToYMD(payload.dateAdhesion);
      }
      if (Object.prototype.hasOwnProperty.call(payload, "dateFin")) {
        payload.dateFin = formatLocalDateToYMD(payload.dateFin);
      }

      // Debug: log the normalized payload that will be sent to the backend
      console.log("MembershipManager - normalized payload:", payload);

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
      setAdding(false);
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
    try {
      await membershipOps.deleteMembership(membershipId, userId);
      // If deleted item was being edited, close editor
      if (editingId === membershipId) {
        setEditingId(null);
      }
      if (refreshFn) await refreshFn();
      else await loadMemberships();
      showSuccess(
        "Adhésion supprimée",
        "L'adhésion a été supprimée avec succès",
        { autoClose: false, prominent: true },
      );
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Impossible de supprimer l'adhésion. Veuillez réessayer.";
      showError("Erreur de suppression", apiMessage, {
        autoClose: false,
        prominent: true,
      });
    }
  };

  return (
    <EditablePanel title={titleNode} actions={headerAction} canEdit={false}>
      <div>
        {/* Afficher formulaire d'ajout inline si adding */}
        {adding && editingId === "new" && (
          <div className="mb-4">
            <MyForm
              key="add"
              fields={membershipFields}
              initialValues={editForm}
              onSubmit={handleEditSubmit}
              onChange={handleFormChange}
              submitButtonLabel="Enregistrer"
              onCancel={() => {
                setAdding(false);
                setEditingId(null);
              }}
              cancelButtonLabel="Annuler"
              allowNoChanges={true}
              inline={true}
              loading={loadingSubmit}
            />
          </div>
        )}

        {sortedMemberships.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedMemberships.map((membership) => (
              <div key={membership.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={editable ? "cursor-pointer flex-1" : "flex-1"}
                  >
                    <div className="space-y-2">
                      {/* Title: year extracted from dateAdhesion (fallback: current year) */}
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900 block">
                          {membership.dateAdhesion
                            ? String(membership.dateAdhesion).slice(0, 4)
                            : new Date().getFullYear()}
                        </span>
                        {/* Active badge: show only when active */}
                        {(membership.active ||
                          isActiveFromDates(
                            membership.dateAdhesion,
                            membership.dateFin,
                          )) && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="text-sm">
                          {membership.dateAdhesion
                            ? formatYmdToDmySlash(membership.dateAdhesion)
                            : ""}
                          {membership.dateFin
                            ? ` — ${formatYmdToDmySlash(membership.dateFin)}`
                            : ""}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ajouté:{" "}
                          {membership.createdAt
                            ? formatIsoTimestampToDmy(membership.createdAt)
                            : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: modifier / supprimer */}
                  {editable && (
                    <div className="flex flex-col items-end gap-2">
                      <ModifyButton
                        size="sm"
                        modifyLabel="Modifier"
                        onModify={() => handleEdit(membership)}
                      />

                      <DeleteButton
                        onDelete={() => handleDelete(membership.id)}
                        size="sm"
                        deleteLabel="Supprimer"
                        confirmTitle="Supprimer l'adhésion"
                        confirmMessage={`Êtes-vous sûr de vouloir supprimer cette adhésion ?`}
                      />
                    </div>
                  )}
                </div>

                {editingId === membership.id && (
                  <div className="mt-3">
                    <MyForm
                      key={membership.id}
                      fields={membershipFields}
                      initialValues={editForm}
                      onSubmit={handleEditSubmit}
                      onChange={handleFormChange}
                      submitButtonLabel="Enregistrer"
                      onCancel={() => setEditingId(null)}
                      cancelButtonLabel="Annuler"
                      loading={loadingSubmit}
                      inline={true}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune adhésion enregistrée</p>
        )}

        {/* Affiche le bouton bas uniquement si la liste est vide (évite une bordure vide sous la liste) */}
        {editable && !adding && sortedMemberships.length === 0 && (
          <div className="mt-0">
            <Button variant="link" size="sm" onClick={handleAddClick}>
              + Ajouter une adhésion
            </Button>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </EditablePanel>
  );
}

MembershipManager.propTypes = {
  label: PropTypes.string,
  memberships: PropTypes.array,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshMemberships: PropTypes.func,
  refreshUser: PropTypes.func,
  editable: PropTypes.bool,
  isAdherent: PropTypes.bool,
};

MembershipManager.defaultProps = {
  label: "Adhésions",
  memberships: [],
  userId: null,
  refreshMemberships: null,
  refreshUser: null,
  editable: true,
  isAdherent: false,
};
