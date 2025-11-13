import React, { useState } from "react";
import EditablePanel from "@/components/ui/EditablePanel";
import AddressManager from "@/components/AddressManager";
import MembershipManager from "@/components/MembershipManager";
import AccountManager from "@/components/AccountManager";
import UserForm from "@/components/UserForm";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useNotification } from "@/hooks/useNotification";
import { useUserOperations } from "@/hooks/useUserOperations";

export default function UserDetails({
  user,
  onDelete,
  showAddresses = true,
  showMemberships = true,
  showAccountsManager = false,
  editAccounts = false,
  refreshUser = null,
  editable = false,
  changePassword = false,
}) {
  if (!user) return null;

  const { updateUser } = useUserOperations();
  const { notification, showSuccess, showError } = useNotification();
  const [savingUser, setSavingUser] = useState(false);

  // Form baseline derived from user — passed to EditablePanel as initialValues
  const [userForm, setUserForm] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    email: user.email || "",
    birthDate: user.birthDate || "",
    phoneMobile: user.phoneMobile || "",
    phoneLandline: user.phoneLandline || "",
    newsletter: !!user.newsletter,
  });

  // Keep local userForm synced with prop `user` when not editing
  React.useEffect(() => {
    if (user) {
      setUserForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        birthDate: user.birthDate || "",
        phoneMobile: user.phoneMobile || "",
        phoneLandline: user.phoneLandline || "",
        newsletter: !!user.newsletter,
      });
    }
  }, [user]);

  const userFields = [
    { name: "firstname", label: "Prénom", type: "text" },
    { name: "lastname", label: "Nom", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "birthDate", label: "Date de naissance", type: "date" },
    { name: "phoneMobile", label: "Téléphone mobile", type: "text" },
    { name: "phoneLandline", label: "Téléphone fixe", type: "text" },
    { name: "newsletter", label: "Newsletter", type: "checkbox" },
  ];

  return (
    <div className="space-y-6">
      <EditablePanel
        title="Profil"
        icon={UserCircleIcon}
        canEdit={editable}
        onDelete={onDelete}
        loading={savingUser}
        // Afficher les boutons Annuler / Enregistrer ici (EditUser souhaité)
        showFooterButtons={true}
        // Désactiver le bouton Enregistrer automatiquement si aucune modification
        disableSaveWhenNoChanges={true}
        initialValues={userForm}
        fields={userFields}
        displayColumns={2}
        onSubmit={async (vals) => {
          // call save
          setSavingUser(true);
          try {
            await updateUser(user.id, vals);
            showSuccess(
              "Utilisateur mis à jour",
              "Les informations ont été enregistrées",
            );
            if (refreshUser) await refreshUser();
          } catch (err) {
            console.error(err);
            showError("Erreur", "Impossible de mettre à jour l'utilisateur");
            throw err;
          } finally {
            setSavingUser(false);
          }
        }}
        renderForm={({
          initialValues,
          onCancel,
          onSubmit,
          onChange,
          loading,
        }) => (
          <UserForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            onChange={onChange}
            loading={loading}
            onCancel={onCancel}
          />
        )}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Nom</span>
            <span> {user.lastname || "-"}</span>
            <span className="text-sm font-semibold text-gray-500">Prénom</span>
            <span> {user.firstname || "-"}</span>
            <span className="text-sm font-semibold text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{user.email || "-"}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Téléphone mobile
            </span>
            <span className="text-sm text-gray-900">
              {user.phoneMobile || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Téléphone fixe
            </span>
            <span className="text-sm text-gray-900">
              {user.phoneLandline || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Date de naissance
            </span>
            <span className="text-sm text-gray-900">
              {user.birthDate
                ? new Date(user.birthDate).toLocaleDateString("fr-FR")
                : "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Newsletter
            </span>
            <span className="text-sm text-gray-900">
              {user.newsletter ? "Oui" : "Non"}
            </span>
          </div>
        </div>
      </EditablePanel>

      {/* Adresses (gérées par AddressManager lorsque showAddresses = true) */}
      {showAddresses && (
        <AddressManager
          label="Adresses"
          addresses={user.addresses || []}
          ownerId={user.id}
          ownerType="USER"
          refreshAddresses={refreshUser}
          editable={editable}
        />
      )}

      {/* Comptes (optionnel: soit AccountManager si demandé, soit AccountDetails ailleurs) */}
      {showAccountsManager ? (
        <AccountManager
          label="Comptes"
          accounts={user.accounts || []}
          userId={user.id}
          refreshUser={refreshUser}
          editable={editAccounts}
          changePassword={changePassword}
        />
      ) : null}

      {/* Adhésions (gérées par MembershipManager lorsque showMemberships = true) */}
      {showMemberships && (
        <MembershipManager
          label="Adhésions"
          memberships={user.memberships || []}
          userId={user.id}
          refreshUser={refreshUser}
          editable={editable}
        />
      )}

      {/* Notification (user-level) */}
      {notification.show && (
        <div className="mt-2">
          {/* Reuse project's Notification component */}
          <div />
        </div>
      )}
    </div>
  );
}

UserDetails.propTypes = {
  user: PropTypes.object,
  onDelete: PropTypes.func,
  showAddresses: PropTypes.bool,
  showMemberships: PropTypes.bool,
  showAccountsManager: PropTypes.bool,
  editAccounts: PropTypes.bool,
  refreshUser: PropTypes.func,
  editable: PropTypes.bool,
  changePassword: PropTypes.bool,
};

UserDetails.defaultProps = {
  showAddresses: true,
  showMemberships: true,
  showAccountsManager: false,
  editAccounts: false,
  refreshUser: null,
  editable: false,
  changePassword: false,
};
