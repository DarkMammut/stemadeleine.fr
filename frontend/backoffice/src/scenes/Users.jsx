"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useUserOperations } from "@/hooks/useUserOperations";
import CardList from "@/components/ui/CardList";
import UserCard from "@/components/UserCard";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import { useAxiosClient } from "@/utils/axiosClient";
import { useNotification } from "@/hooks/useNotification";

export default function Users() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdherentsOnly, setShowAdherentsOnly] = useState(false);
  // search and sort state for Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState({ field: null, direction: null });

  const { getAllUsers, createUser } = useUserOperations();
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // guard against race conditions when multiple loadUsers run concurrently
  const fetchIdRef = useRef(0);
  // abort controller ref to cancel in-flight requests
  const abortControllerRef = useRef(null);
  // sync guard: avoid writing URL during initial load
  const initialSyncRef = useRef(false);
  // debounce timer for URL updates
  const urlUpdateTimerRef = useRef(null);

  const loadUsers = async (page = 0, size = pageInfo.size) => {
    let thisFetchId = undefined;
    try {
      setLoading(true);
      fetchIdRef.current += 1;
      thisFetchId = fetchIdRef.current;

      // cancel any in-flight request
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const options = { search: searchQuery };
      if (sortState.field) {
        options.sortField = sortState.field;
        options.sortDir = sortState.direction;
      }
      // attach abort signal
      options.signal = controller.signal;

      const data = await getAllUsers(showAdherentsOnly, page, size, options);
      if (fetchIdRef.current === thisFetchId) {
        setUsers(data.content || []);
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
      } else {
        // discarded stale server fetch result
      }
    } catch (error) {
      // if aborted, do not show an error notification
      if (error?.name === "CanceledError" || error?.message === "canceled") {
        // request aborted
        return;
      }
      console.error("Error loading users:", error);
      showError(
        "Erreur de chargement",
        "Impossible de charger les utilisateurs",
      );
    } finally {
      // only turn off loading for the latest fetch (and if thisFetchId was set)
      if (thisFetchId !== undefined && fetchIdRef.current === thisFetchId)
        setLoading(false);
    }
  };

  useEffect(() => {
    // when toggling the filter, always reset to first page and load it
    setPageInfo((p) => ({ ...p, page: 0 }));
    loadUsers(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdherentsOnly]);

  // initial sync from query params (only once after mount)
  useEffect(() => {
    if (!searchParams) return;
    // read query params and initialize state
    const q = searchParams.get("search");
    const sortField = searchParams.get("sortField");
    const sortDir = searchParams.get("sortDir");
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const adherents = searchParams.get("adherents") === "true";

    if (q) setSearchQuery(q);
    if (sortField)
      setSortState({ field: sortField, direction: sortDir || "asc" });
    setPageInfo((p) => ({
      ...p,
      page: Number.isNaN(page) ? 0 : page,
      size: Number.isNaN(size) ? p.size : size,
    }));
    setShowAdherentsOnly(adherents);

    // mark initial sync done after states are scheduled
    setTimeout(() => {
      initialSyncRef.current = true;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep state in sync if URL params change afterwards (e.g., back/forward navigation or external link)
  useEffect(() => {
    if (!searchParams) return;
    if (!initialSyncRef.current) return;
    // parse params
    const q = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || null;
    const sortDir = searchParams.get("sortDir") || null;
    const page = parseInt(searchParams.get("page") || "0", 10) || 0;
    const size = parseInt(searchParams.get("size") || "10", 10) || 10;
    const adherents = searchParams.get("adherents") === "true";

    // update only if different to avoid loops
    if (q !== searchQuery) setSearchQuery(q);
    const parsedSort = sortField
      ? { field: sortField, direction: sortDir || "asc" }
      : { field: null, direction: null };
    if (
      parsedSort.field !== (sortState.field || null) ||
      parsedSort.direction !== (sortState.direction || null)
    ) {
      setSortState(parsedSort);
    }
    if (page !== pageInfo.page || size !== pageInfo.size) {
      setPageInfo((p) => ({ ...p, page, size }));
    }
    if (adherents !== showAdherentsOnly) setShowAdherentsOnly(adherents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  // reload when search or sort changes (reset to first page)
  useEffect(() => {
    setPageInfo((p) => ({ ...p, page: 0 }));
    loadUsers(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortState]);

  // keep URL in sync with current filters/state (debounced)
  useEffect(() => {
    if (!initialSyncRef.current) return;
    try {
      if (urlUpdateTimerRef.current) {
        clearTimeout(urlUpdateTimerRef.current);
      }
      urlUpdateTimerRef.current = setTimeout(() => {
        try {
          const params = new URLSearchParams();
          if (searchQuery) params.set("search", searchQuery);
          if (sortState.field) {
            params.set("sortField", sortState.field);
            if (sortState.direction) params.set("sortDir", sortState.direction);
          }
          if (pageInfo.page) params.set("page", String(pageInfo.page));
          if (pageInfo.size) params.set("size", String(pageInfo.size));
          if (showAdherentsOnly) params.set("adherents", "true");

          const path =
            typeof window !== "undefined" ? window.location.pathname : "/users";
          const url = params.toString() ? `${path}?${params.toString()}` : path;
          // push (add history entry) so user can navigate back between filter states
          router.push(url);
        } catch (err) {
          console.warn("Failed to build URL params", err);
        }
      }, 300);
    } catch (e) {
      console.warn("Failed to sync URL params", e);
    }
    return () => {
      if (urlUpdateTimerRef.current) clearTimeout(urlUpdateTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortState, pageInfo.page, pageInfo.size, showAdherentsOnly]);

  // stable callbacks for Filters to avoid linter warnings and unnecessary rerenders
  const handleFiltersSearch = useCallback((q) => setSearchQuery(q), []);
  const handleFiltersSort = useCallback((s) => setSortState(s), []);
  const handleFiltersFilter = useCallback(({ key, value }) => {
    if (key === "adherents") {
      setShowAdherentsOnly(Boolean(value));
    }
    // for other filters we could extend here
  }, []);

  const filtersConfig = useMemo(
    () => ({
      fields: [
        { key: "lastname", label: "Nom", icon: UserIcon },
        { key: "firstname", label: "Prénom", icon: UserIcon },
        { key: "email", label: "Email", icon: EnvelopeIcon },
        { key: "createdAt", label: "Date", icon: CalendarDaysIcon },
      ],
      onSearch: handleFiltersSearch,
      onSortChange: handleFiltersSort,
      filterItems: [
        {
          key: "adherents",
          label: "Adhérents",
          type: "toggle",
          value: showAdherentsOnly,
        },
      ],
      onFilterChange: handleFiltersFilter,
      onClearFilters: () => {
        // reset filters atomically
        setShowAdherentsOnly(false);
        setSearchQuery("");
        setSortState({ field: null, direction: null });
        setPageInfo((p) => ({ ...p, page: 0 }));
        // update url and reload
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", String(pageInfo.size));
        const path =
          typeof window !== "undefined" ? window.location.pathname : "/users";
        const url = params.toString() ? `${path}?${params.toString()}` : path;
        try {
          router.push(url);
        } catch (e) {
          try {
            window.history.replaceState(null, "", url);
          } catch (_) {}
        }
        loadUsers(0, pageInfo.size);
      },
      // controlled values so Filters stays in sync with Users state
      searchValue: searchQuery,
      sortValue: sortState,
      initialSort: { field: null, direction: null },
      placeholder: "Rechercher un utilisateur...",
    }),
    [
      handleFiltersSearch,
      handleFiltersSort,
      searchQuery,
      sortState,
      showAdherentsOnly,
    ],
  );

  const handleCreateUser = async () => {
    try {
      await createUser({
        firstname: "Nouvel Utilisateur",
        lastname: "",
        email: "",
        phoneMobile: "",
        phoneLandline: "",
        newsletter: false,
        birthDate: null,
      });
      await loadUsers();
      showSuccess(
        "Utilisateur créé",
        "Un nouvel utilisateur a été créé avec succès",
      );
    } catch (error) {
      console.error("Error creating user:", error);
      showError("Erreur de création", "Impossible de créer l'utilisateur");
    }
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/users/import");
      await loadUsers();
      showSuccess(
        "Import HelloAsso terminé",
        "Les données ont été importées avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      showError(
        "Erreur d'import",
        "Impossible d'importer les données HelloAsso",
      );
    }
  };

  const handleUserClick = (user) => {
    router.push(`/users/${user.id}`);
  };

  // show header + utilities and skeleton to avoid flashes
  return (
    <SceneLayout>
      <Title label={showAdherentsOnly ? "Adhérents" : "Utilisateurs"} />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvel Utilisateur",
            callback: handleCreateUser,
          },
          {
            variant: "refresh",
            label: "Actualiser HelloAsso",
            callback: handleImportHelloAsso,
            hoverExpand: true,
          },
        ]}
        // configure optional Filters to appear in Utilities
        filtersConfig={filtersConfig}
      />

      {loading ? (
        <div className="mt-4">
          <LoadingSkeleton variant="card" count={10} showActions={false} />
        </div>
      ) : (
        <CardList emptyMessage="Aucun utilisateur trouvé.">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => handleUserClick(user)}
              showAdherentFlag={showAdherentsOnly}
            />
          ))}
        </CardList>
      )}

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        pageSize={pageInfo.size}
        totalElements={
          typeof pageInfo.totalElements === "number"
            ? pageInfo.totalElements
            : undefined
        }
        onChange={(p) => loadUsers(p, pageInfo.size)}
        onPageSizeChange={(newSize) => {
          // reset to first page when page size changes
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
          loadUsers(0, newSize);
        }}
      />

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </SceneLayout>
  );
}
