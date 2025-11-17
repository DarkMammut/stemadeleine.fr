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
  ArrowPathIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useContactOperations } from "@/hooks/useContactOperations";
import { useContactsContext } from "@/contexts/ContactsContext";
import CardList from "@/components/ui/CardList";
import ContactCard from "@/components/ui/ContactCard";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import Pagination from "@/components/ui/Pagination";

export default function Contacts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  // filter: all, unread, read
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState({ field: null, direction: null });

  const fetchIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const initialSyncRef = useRef(false);
  const urlUpdateTimerRef = useRef(null);

  const { getAllContacts, markContactAsRead } = useContactOperations();
  const { refreshUnreadCount } = useContactsContext();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadContacts(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadContacts = async (page = 0, size = pageInfo.size) => {
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
        search: searchQuery || undefined,
        sortField: sortState?.field || undefined,
        sortDir: sortState?.direction || undefined,
        filter: filter && filter !== "all" ? filter : undefined,
      };
      const data = await getAllContacts(page, size, options);

      if (fetchIdRef.current === thisFetchId) {
        setContacts(data.content || []);
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
      await refreshUnreadCount();
    } catch (error) {
      if (error?.name === "CanceledError" || error?.message === "canceled")
        return;
      // give more context when network or server error
      console.error(
        "Error loading contacts:",
        error,
        error?.response?.data || {},
      );
      const serverMessage = error?.response?.data?.message || null;
      showError(
        "Erreur de chargement",
        serverMessage || "Impossible de charger les contacts",
      );
    } finally {
      if (thisFetchId !== undefined && fetchIdRef.current === thisFetchId)
        setLoading(false);
    }
  };

  const handleContactClick = async (contact) => {
    // Mark as read when clicked if not already read
    if (!contact.isRead) {
      try {
        await markContactAsRead(contact.id, true);
        // Update local state
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, isRead: true } : c)),
        );
        // Refresh unread count in navbar
        await refreshUnreadCount();
      } catch (error) {
        console.error("Error marking contact as read:", error);
        showError("Erreur", "Impossible de marquer le contact comme lu");
      }
    }
    // Navigate to contact detail page
    router.push(`/contacts/${contact.id}`);
  };

  const handleRefresh = async () => {
    try {
      await loadContacts();
      showSuccess(
        "Actualisation réussie",
        "La liste des contacts a été mise à jour",
      );
    } catch (error) {
      // Error already handled in loadContacts
    }
  };

  // remove toggleFilter; filter controlled via Filters popover
  const getFilterLabel = useCallback(() => {
    if (filter === "unread") return "Non lus";
    if (filter === "read") return "Lus";
    return "Tous";
  }, [filter]);

  const filteredContacts = contacts; // backend handles filter when loading

  // initial sync from URL
  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get("search");
    const sortField = searchParams.get("sortField");
    const sortDir = searchParams.get("sortDir");
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const f = searchParams.get("filter") || "all";

    if (q) setSearchQuery(q);
    if (sortField)
      setSortState({ field: sortField, direction: sortDir || "asc" });
    setPageInfo((p) => ({
      ...p,
      page: Number.isNaN(page) ? 0 : page,
      size: Number.isNaN(size) ? p.size : size,
    }));
    setFilter(f);

    setTimeout(() => (initialSyncRef.current = true), 0);
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
      if (filter && filter !== "all") params.set("filter", filter);

      const path =
        typeof window !== "undefined" ? window.location.pathname : "/contacts";
      const url = params.toString() ? `${path}?${params.toString()}` : path;
      router.push(url);
    }, 300);
    return () => {
      if (urlUpdateTimerRef.current) clearTimeout(urlUpdateTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortState, pageInfo.page, pageInfo.size, filter]);

  // reload when search, sort or filter changes (reset to first page)
  useEffect(() => {
    // Always reload when filters change (reset to first page)
    setPageInfo((p) => ({ ...p, page: 0 }));
    loadContacts(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortState, filter]);

  const handleFiltersSearch = useCallback((q) => setSearchQuery(q), []);
  const handleFiltersSort = useCallback((s) => setSortState(s), []);
  const handleFiltersFilter = useCallback(({ key, value }) => {
    if (key === "unread") {
      setFilter(value ? "unread" : "all");
    }
  }, []);

  const filtersConfig = useMemo(
    () => ({
      fields: [
        { key: "lastName", label: "Nom", icon: UserIcon },
        { key: "firstName", label: "Prénom", icon: UserIcon },
        { key: "email", label: "Email", icon: EnvelopeIcon },
        { key: "createdAt", label: "Date", icon: CalendarDaysIcon },
      ],
      onSearch: handleFiltersSearch,
      onSortChange: handleFiltersSort,
      filterItems: [
        {
          key: "unread",
          label: "Non lus uniquement",
          type: "toggle",
          value: filter === "unread",
        },
      ],
      onFilterChange: handleFiltersFilter,
      onClearFilters: () => {
        // reset filters
        setSearchQuery("");
        setSortState({ field: null, direction: null });
        setFilter("all");
        setPageInfo((p) => ({ ...p, page: 0 }));
        // update url and reload
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", String(pageInfo.size));
        const path =
          typeof window !== "undefined"
            ? window.location.pathname
            : "/contacts";
        const url = params.toString() ? `${path}?${params.toString()}` : path;
        try {
          router.push(url);
        } catch (e) {
          try {
            window.history.replaceState(null, "", url);
          } catch (_) {}
        }
        loadContacts(0, pageInfo.size);
      },
      searchValue: searchQuery,
      sortValue: sortState,
      initialSort: { field: null, direction: null },
      placeholder: "Rechercher un contact...",
    }),
    [
      handleFiltersSearch,
      handleFiltersSort,
      handleFiltersFilter,
      searchQuery,
      sortState,
      filter,
    ],
  );

  // show header + utilities and skeleton to avoid flashes
  return (
    <SceneLayout>
      <Title
        label={
          filter === "unread" ? `Demandes — ${getFilterLabel()}` : "Demandes"
        }
      />

      <Utilities
        actions={[
          {
            icon: ArrowPathIcon,
            label: "Actualiser",
            callback: handleRefresh,
            variant: "refresh",
          },
        ]}
        filtersConfig={filtersConfig}
      />

      {loading ? (
        <div className="mt-4">
          <LoadingSkeleton variant="card" count={6} showActions={false} />
        </div>
      ) : (
        <CardList emptyMessage="Aucun contact trouvé.">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => handleContactClick(contact)}
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
        onChange={(p) => loadContacts(p, pageInfo.size)}
        onPageSizeChange={(newSize) => {
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
          loadContacts(0, newSize);
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
