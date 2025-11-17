"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import CardList from "@/components/ui/CardList";
import Card from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useUserOperations } from "@/hooks/useUserOperations";
import { isAdminUser } from "@/utils/roles";
import { useRouter, useSearchParams } from "next/navigation";
import Utilities from "@/components/ui/Utilities";
import Pagination from "@/components/ui/Pagination";
import { PlusIcon } from "@heroicons/react/24/outline";
import AddAccountModal from "@/components/AddAccountModal";

export default function Accounts() {
  const { notification, showError, hideNotification } = useNotification();
  const accountOps = useAccountOperations();
  const { getCurrentUser } = useUserOperations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState({ field: null, direction: null });
  const [roleFilter, setRoleFilter] = useState(null);
  const [providerFilter, setProviderFilter] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const initialSyncRef = useRef(false);
  const urlUpdateTimerRef = useRef(null);

  // initial sync from URL
  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get("search");
    const sortField = searchParams.get("sortField");
    const sortDir = searchParams.get("sortDir");
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const role = searchParams.get("role");
    const provider = searchParams.get("provider");

    if (q) setSearchQuery(q);
    if (sortField)
      setSortState({ field: sortField, direction: sortDir || "asc" });
    setPageInfo((p) => ({
      ...p,
      page: Number.isNaN(page) ? 0 : page,
      size: Number.isNaN(size) ? p.size : size,
    }));
    setRoleFilter(role || null);
    setProviderFilter(provider || null);

    setTimeout(() => (initialSyncRef.current = true), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAccounts = async (
    page = 0,
    size = pageInfo.size,
    overrides = {},
  ) => {
    let thisFetchId = undefined;
    try {
      setLoading(true);
      fetchIdRef.current += 1;
      thisFetchId = fetchIdRef.current;

      // cancel in-flight
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {}
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const options = {
        signal: controller.signal,
        search: overrides.search !== undefined ? overrides.search : searchQuery,
        sortField:
          overrides.sortField !== undefined
            ? overrides.sortField
            : sortState.field,
        sortDir:
          overrides.sortDir !== undefined
            ? overrides.sortDir
            : sortState.direction,
        role: overrides.role !== undefined ? overrides.role : roleFilter,
        provider:
          overrides.provider !== undefined
            ? overrides.provider
            : providerFilter,
      };

      const data = await accountOps.getAccounts(page, size, options);

      // If the request was cancelled, getAccounts returns null — bail out silently
      if (!data) {
        // only stop here if this fetch is the current one
        if (fetchIdRef.current === thisFetchId) setLoading(false);
        return;
      }

      if (fetchIdRef.current === thisFetchId) {
        setAccounts(data.content || []);
        setPageInfo((p) => ({
          ...p,
          page: data.number || 0,
          totalPages: data.totalPages || 0,
          size: data.size || size,
          totalElements:
            typeof data.totalElements === "number"
              ? data.totalElements
              : p.totalElements,
        }));
      }
    } catch (error) {
      if (error?.name === "CanceledError" || error?.message === "canceled")
        return;
      console.error("Error loading accounts:", error);
      showError("Erreur de chargement", "Impossible de charger les comptes");
    } finally {
      if (thisFetchId !== undefined && fetchIdRef.current === thisFetchId)
        setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await getCurrentUser();
        if (!isAdminUser(u)) return;
        // load initial page
        await loadAccounts(pageInfo.page, pageInfo.size);
      } catch (e) {
        showError("Erreur de chargement", "Impossible de charger les comptes");
      } finally {
        setLoading(false);
      }
    })();

    return () => hideNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep URL in sync (debounced)
  useEffect(() => {
    if (!initialSyncRef.current) return;
    if (urlUpdateTimerRef.current) clearTimeout(urlUpdateTimerRef.current);
    urlUpdateTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (sortState.field) {
        params.set("sortField", sortState.field);
        if (sortState.direction) params.set("sortDir", sortState.direction);
      }
      if (pageInfo.page) params.set("page", String(pageInfo.page));
      if (pageInfo.size) params.set("size", String(pageInfo.size));
      if (roleFilter) params.set("role", roleFilter);
      if (providerFilter) params.set("provider", providerFilter);

      const path =
        typeof window !== "undefined"
          ? window.location.pathname
          : "/settings/accounts";
      const url = params.toString() ? `${path}?${params.toString()}` : path;
      try {
        router.push(url);
      } catch (e) {
        try {
          window.history.replaceState(null, "", url);
        } catch (_) {}
      }
    }, 300);
    return () => {
      if (urlUpdateTimerRef.current) clearTimeout(urlUpdateTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    sortState,
    pageInfo.page,
    pageInfo.size,
    roleFilter,
    providerFilter,
  ]);

  // reload when search, sort or filter changes (reset to first page)
  useEffect(() => {
    setPageInfo((p) => ({ ...p, page: 0 }));
    loadAccounts(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortState, roleFilter, providerFilter]);

  const handleFiltersSearch = useCallback((q) => setSearchQuery(q), []);
  const handleFiltersSort = useCallback((s) => setSortState(s), []);
  const handleFiltersFilter = useCallback(({ key, value }) => {
    if (key === "role") {
      setRoleFilter(value ? value : null);
    }
    if (key === "provider") {
      setProviderFilter(value ? value : null);
    }
  }, []);

  // Define role and provider options (could be fetched from backend if dynamic)
  const roleOptions = useMemo(() => {
    return [
      { value: "", label: "Tous" },
      { value: "ROLE_USER", label: "Utilisateur" },
      { value: "ROLE_ADMIN", label: "Administrateur" },
    ];
  }, []);

  const providerOptions = useMemo(() => {
    return [
      { value: "", label: "Tous" },
      { value: "local", label: "Local" },
      { value: "google", label: "Google" },
      { value: "github", label: "GitHub" },
    ];
  }, []);

  const filtersConfig = useMemo(
    () => ({
      fields: [
        { key: "email", label: "Email" },
        { key: "provider", label: "Fournisseur" },
        { key: "role", label: "Rôle" },
      ],
      onSearch: handleFiltersSearch,
      onSortChange: handleFiltersSort,
      filterItems: [
        {
          key: "role",
          label: "Rôle",
          type: "select",
          value: roleFilter,
          options: roleOptions,
        },
        {
          key: "provider",
          label: "Fournisseur",
          type: "select",
          value: providerFilter,
          options: providerOptions,
        },
      ],
      onFilterChange: handleFiltersFilter,
      onClearFilters: () => {
        setSearchQuery("");
        setSortState({ field: null, direction: null });
        setRoleFilter(null);
        setProviderFilter(null);
        setPageInfo((p) => ({ ...p, page: 0 }));
        loadAccounts(0, pageInfo.size, {
          search: "",
          sortField: null,
          sortDir: null,
          role: null,
          provider: null,
        });
      },
      searchValue: searchQuery,
      sortValue: sortState,
      initialSort: { field: null, direction: null },
      placeholder: "Rechercher un compte...",
    }),
    [
      handleFiltersSearch,
      handleFiltersSort,
      handleFiltersFilter,
      searchQuery,
      sortState,
      roleFilter,
      providerFilter,
      pageInfo.size,
      roleOptions,
      providerOptions,
    ],
  );

  // selectedId can be provided in the query string (e.g. ?selected=<id>) to mark a card
  let selectedId = null;
  try {
    selectedId = searchParams?.get("selected") || null;
  } catch (e) {}
  if (!selectedId && typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      selectedId = params.get("selected") || null;
    } catch (e) {
      selectedId = null;
    }
  }

  const handleCreateAccount = async () => {
    // Open the create-account modal instead of creating silently
    setShowCreateModal(true);
  };

  return (
    <SceneLayout>
      <Title label="Comptes" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouveau Compte",
            callback: handleCreateAccount,
          },
        ]}
        filtersConfig={filtersConfig}
      />

      <div className="space-y-6">
        {loading ? (
          <div className="mt-4">
            <LoadingSkeleton variant="card" count={6} showActions={false} />
          </div>
        ) : (
          <CardList emptyMessage={"Aucun compte trouvé."}>
            {(accounts || []).map((acc) => (
              <Card
                key={acc.id}
                onClick={() => router.push(`/settings/accounts/${acc.id}`)}
                className={acc.id === selectedId ? "bg-blue-50" : ""}
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {acc.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    {acc.provider || "local"}
                  </div>
                  <div className="text-sm text-gray-500">{acc.role}</div>
                </div>
              </Card>
            ))}
          </CardList>
        )}
      </div>

      <AddAccountModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={async () => {
          try {
            await loadAccounts(pageInfo.page, pageInfo.size);
          } catch (e) {
            console.error("Erreur refresh après création:", e);
          }
        }}
      />

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        pageSize={pageInfo.size}
        totalElements={
          typeof pageInfo.totalElements === "number"
            ? pageInfo.totalElements
            : undefined
        }
        onChange={(p) => {
          setPageInfo((prev) => ({ ...prev, page: p }));
          loadAccounts(p, pageInfo.size);
        }}
        onPageSizeChange={(newSize) => {
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
          loadAccounts(0, newSize);
        }}
      />

      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </SceneLayout>
  );
}
