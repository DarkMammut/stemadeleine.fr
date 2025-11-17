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
  PlusIcon,
  TagIcon,
  UnderlineIcon,
} from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useNewsPublicationOperations } from "@/hooks/useNewsPublicationOperations";
import CardList from "@/components/ui/CardList";
import NewsCard from "@/components/NewsCard";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import Pagination from "@/components/ui/Pagination";

export default function News() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [news, setNews] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // filters
  const [publishedOnly, setPublishedOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState({ field: null, direction: null });

  const fetchIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const initialSyncRef = useRef(false);
  const urlUpdateTimerRef = useRef(null);

  const { getAllNewsPublications, createNewsPublication } =
    useNewsPublicationOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadNews(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNews = async (page = 0, size = pageInfo.size) => {
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
        isPublished: publishedOnly || undefined,
        isActive: activeOnly || undefined,
      };

      const data = await getAllNewsPublications(page, size, options);
      setNews(data.content || []);
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
    } catch (error) {
      if (error?.name === "CanceledError" || error?.message === "canceled")
        return;
      console.error("Error loading news:", error);
      showError("Erreur de chargement", "Impossible de charger les actualités");
    } finally {
      if (thisFetchId !== undefined && fetchIdRef.current === thisFetchId)
        setLoading(false);
    }
  };

  const handleCreateNews = async () => {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await createNewsPublication({
        name: "Nouvelle Actualité",
        title: "Nouvelle Actualité",
        description: "Description de l'actualité",
        isVisible: false,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      });
      await loadNews();
      showSuccess(
        "Actualité créée",
        "Une nouvelle actualité a été créée avec succès",
      );
    } catch (error) {
      console.error("Error creating news:", error);
      showError("Erreur de création", "Impossible de créer l'actualité");
    }
  };

  const handleNewsClick = (newsItem) => {
    router.push(`/news/${newsItem.id}`);
  };

  // initial sync from URL
  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get("search");
    const sortParam = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const pub = searchParams.get("published") === "true";
    const active = searchParams.get("active") === "true";

    if (q) setSearchQuery(q);
    if (sortParam) {
      const [field, dir] = sortParam.split(",");
      setSortState({ field: field || null, direction: dir || "asc" });
    }
    setPageInfo((p) => ({
      ...p,
      page: Number.isNaN(page) ? 0 : page,
      size: Number.isNaN(size) ? p.size : size,
    }));
    setPublishedOnly(pub);
    setActiveOnly(active);

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
        params.set(
          "sort",
          `${sortState.field},${sortState.direction || "asc"}`,
        );
      }
      if (pageInfo.page) params.set("page", String(pageInfo.page));
      if (pageInfo.size) params.set("size", String(pageInfo.size));
      if (publishedOnly) params.set("published", "true");
      if (activeOnly) params.set("active", "true");

      const path =
        typeof window !== "undefined" ? window.location.pathname : "/news";
      const url = params.toString() ? `${path}?${params.toString()}` : path;
      router.push(url);
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
    publishedOnly,
    activeOnly,
  ]);

  // reload when search, sort or filter changes (reset to first page)
  useEffect(() => {
    setPageInfo((p) => ({ ...p, page: 0 }));
    loadNews(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortState, publishedOnly, activeOnly]);

  const handleFiltersSearch = useCallback((q) => setSearchQuery(q), []);
  const handleFiltersSort = useCallback((s) => setSortState(s), []);
  const handleFiltersFilter = useCallback(({ key, value }) => {
    if (key === "published") {
      setPublishedOnly(Boolean(value));
    }
    if (key === "active") {
      setActiveOnly(Boolean(value));
    }
  }, []);

  const filtersConfig = useMemo(
    () => ({
      fields: [
        { key: "name", label: "Nom", icon: TagIcon },
        { key: "title", label: "Titre", icon: UnderlineIcon },
        { key: "createdAt", label: "Date", icon: CalendarDaysIcon },
        { key: "startDate", label: "Date début", icon: CalendarDaysIcon },
        { key: "endDate", label: "Date fin", icon: CalendarDaysIcon },
      ],
      onSearch: handleFiltersSearch,
      onSortChange: handleFiltersSort,
      filterItems: [
        {
          key: "published",
          label: "Publiés",
          type: "toggle",
          value: publishedOnly,
        },
        {
          key: "active",
          label: "Actifs",
          type: "toggle",
          value: activeOnly,
        },
      ],
      onFilterChange: handleFiltersFilter,
      onClearFilters: () => {
        setPublishedOnly(false);
        setActiveOnly(false);
        setSearchQuery("");
        setSortState({ field: null, direction: null });
        setPageInfo((p) => ({ ...p, page: 0 }));
        // update url and reload
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", String(pageInfo.size));
        const path =
          typeof window !== "undefined" ? window.location.pathname : "/news";
        const url = params.toString() ? `${path}?${params.toString()}` : path;
        try {
          router.push(url);
        } catch (e) {
          try {
            window.history.replaceState(null, "", url);
          } catch (_) {}
        }
        loadNews(0, pageInfo.size);
      },
      searchValue: searchQuery,
      sortValue: sortState,
      initialSort: { field: null, direction: null },
      placeholder: "Rechercher une actualité...",
    }),
    [
      handleFiltersSearch,
      handleFiltersSort,
      searchQuery,
      sortState,
      publishedOnly,
      activeOnly,
    ],
  );

  // loading flag is used directly; no local alias needed

  return (
    <SceneLayout>
      <Title label="Actualités" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle News",
            callback: handleCreateNews,
            disabled: loading,
          },
        ]}
        filtersConfig={filtersConfig}
      />

      {loading ? (
        <div className="mt-4">
          <LoadingSkeleton variant="card" count={6} showActions={true} />
        </div>
      ) : (
        <CardList emptyMessage="Aucune news trouvée.">
          {news.map((newsItem) => (
            <NewsCard
              key={newsItem.id}
              news={newsItem}
              onClick={() => handleNewsClick(newsItem)}
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
        onChange={(p) => loadNews(p, pageInfo.size)}
        onPageSizeChange={(newSize) => {
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
          loadNews(0, newSize);
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
