"use client";

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Panel from "@/components/ui/Panel";
import Autocomplete from "@/components/ui/Autocomplete";
import Select from "@/components/ui/Select";
import AddUserModal from "@/components/AddUserModal";
import Button from "@/components/ui/Button";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/i18n/I18nContext";

export default function AccountForm({
  initialValues = { email: "", role: "ROLE_USER", provider: "local" },
  onCreated,
  onCancel,
}) {
  const { t } = useTranslation();
  const accountOps = useAccountOperations();
  const { getAllUsers } = useUserOperations();
  // destructure stable callbacks to avoid triggering effects when the parent object is recreated
  const { getRoles } = accountOps;
  const { showError, showSuccess } = useNotification();

  // Normalize incoming initial role to full enum name if needed
  const normalizeInitial = (vals) => {
    const copy = { ...(vals || {}) };
    if (copy.role && typeof copy.role === "string") {
      if (!copy.role.startsWith("ROLE_")) copy.role = `ROLE_${copy.role}`;
    } else {
      copy.role = "ROLE_USER";
    }
    return copy;
  };

  const [formValues, setFormValues] = useState(() =>
    normalizeInitial(initialValues),
  );
  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([
    { label: t("accounts.chooseOption"), value: "" },
    { label: t("accounts.roleUser"), value: "ROLE_USER" },
    { label: t("accounts.roleAdmin"), value: "ROLE_ADMIN" },
  ]);
  // avoid repeated fetches if effect re-runs due to parent re-creations
  const rolesLoadedRef = useRef(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // preload users (limited)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllUsers(false, 0, 200);
        const list = res && res.content ? res.content : res;
        const mapped = (list || []).map((u) => ({
          label:
            u.displayName ||
            u.email ||
            `${u.firstname || ""} ${u.lastname || ""}`,
          value: u.id,
        }));
        if (mounted) setUserOptions(mapped);
      } catch (err) {
        console.error("Erreur chargement utilisateurs", err);
      } finally {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
    // Depend on getAllUsers (stable if hook uses useCallback/useMemo), avoids stale closures
  }, [getAllUsers]);

  // preload roles from backend (if available)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (rolesLoadedRef.current) return;
        if (typeof getRoles === "function") {
          const roles = await getRoles();
          if (!mounted) return;
          if (Array.isArray(roles) && roles.length > 0) {
            const opts = roles.map((r) => ({
              value: r,
              label:
                r === "ROLE_ADMIN"
                  ? t("accounts.roleAdmin")
                  : r === "ROLE_USER"
                    ? t("accounts.roleUser")
                    : r.replace(/^ROLE_/, ""),
            }));
            setRoleOptions([{ label: t("accounts.chooseOption"), value: "" }, ...opts]);
            // If current formValues.role is short (e.g. USER), normalize it to ROLE_*
            setFormValues((prev) => {
              const cur = prev && prev.role ? prev.role : "ROLE_USER";
              const normalized = cur.startsWith("ROLE_") ? cur : `ROLE_${cur}`;
              // avoid setting state if identical to prevent extra rerenders
              if (String(prev?.role) === String(normalized)) return prev;
              return { ...(prev || {}), role: normalized };
            });
            // mark as loaded to avoid refetching in loops
            rolesLoadedRef.current = true;
          }
        }
      } catch (err) {
        console.warn("Unable to fetch roles, keep defaults", err);
      }
    })();
    return () => {
      mounted = false;
    };
    // depends on getRoles which is stable thanks to useCallback in the hook
  }, [getRoles, t]);

  const validate = () => {
    const e = {};
    if (!formValues.email || String(formValues.email).trim() === "") {
      e.email = t("accounts.form.emailRequired");
    }
    // add more validation as needed
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (name, val) => {
    setFormValues((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...formValues };
      if (selectedUser) payload.user = { id: selectedUser };

      const created = await accountOps.createAccount(payload);

      // fallback attach if needed
      if (selectedUser && (!created || !created.user)) {
        try {
          await accountOps.attachUser(created.id, selectedUser);
        } catch (e) {
          console.error("Fallback attachUser failed:", e);
        }
      }

      showSuccess(
        t("accounts.form.successTitle"),
        t("accounts.form.successMessage"),
      );
      if (typeof onCreated === "function") await onCreated(created);
      // close modal after creation
      try {
        if (typeof onCancel === "function") onCancel();
      } catch (e) {}
      return created;
    } catch (err) {
      console.error("Erreur création compte:", err);
      showError(t("accounts.form.errorTitle"), t("accounts.form.errorMessage"));
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel title={t("accounts.form.title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-900">
              {t("accounts.form.email")}
            </label>
            <div className="mt-2">
              <input
                name="email"
                type="text"
                value={formValues.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`block w-full rounded-md px-3 py-2 text-base text-gray-700 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                  errors.email ? "outline-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-900">
              {t("accounts.form.role")}
            </label>
            <div className="mt-2">
              <Select
                value={formValues.role || "ROLE_USER"}
                onValueChange={(v) => handleChange("role", v)}
                options={roleOptions}
                placeholder={null}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-900">
              {t("accounts.form.provider")}
            </label>
            <div className="mt-2">
              <input
                name="provider"
                type="text"
                value={formValues.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
                placeholder={t("accounts.form.providerPlaceholder")}
                className="block w-full rounded-md px-3 py-2 text-base text-gray-700 bg-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm/6 font-medium text-gray-900">
              {t("accounts.form.linkedUser")}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-80">
                <Autocomplete
                  value={selectedUser}
                  onChange={(val) => setSelectedUser(val)}
                  options={userOptions}
                  labelKey="label"
                  valueKey="value"
                  placeholder={t("accounts.form.noUser")}
                />
              </div>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setShowCreateUserModal(true)}
                className="ml-2"
              >
                {t("accounts.form.createUser")}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-x-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={submitting}
          >
            {t("accounts.form.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
          >
            {submitting ? t("accounts.form.creating") : t("accounts.form.create")}
          </Button>
        </div>

        <AddUserModal
          open={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onCreate={(created) => {
            if (created && created.id) {
              // add to options and select
              const label =
                created.displayName ||
                created.email ||
                `${created.firstname || ""} ${created.lastname || ""}`;
              const opt = { label, value: created.id };
              setUserOptions((prev) => [opt, ...(prev || [])]);
              setSelectedUser(created.id);
              setShowCreateUserModal(false);
            }
          }}
        />
      </form>
    </Panel>
  );
}

AccountForm.propTypes = {
  initialValues: PropTypes.object,
  onCreated: PropTypes.func,
  onCancel: PropTypes.func,
};

AccountForm.defaultProps = {
  initialValues: { email: "", role: "ROLE_USER", provider: "local" },
  onCreated: null,
  onCancel: null,
};
