"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {useRouter, useSearchParams} from "next/navigation";

// Icons
import {CalendarDaysIcon, PlusIcon, TagIcon, UnderlineIcon,} from "@heroicons/react/24/outline";

// Hooks (business)
import {useNewsletterPublicationOperations} from "@/hooks/useNewsletterPublicationOperations";
import {useNotification} from "@/hooks/useNotification";

// UI / Components
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import CardList from "@/components/ui/CardList";
import NewsletterCard from "@/components/NewsletterCard";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import NewsletterAllVariantAlert from "@/components/NewsletterAllVariantAlert";

export default function Newsletters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newsletters, setNewsletters] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);

    // filters
    const [publishedOnly, setPublishedOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortState, setSortState] = useState({field: null, direction: null});

    const fetchIdRef = useRef(0);
    const abortControllerRef = useRef(null);
    const initialSyncRef = useRef(false);
    const urlUpdateTimerRef = useRef(null);

    const {getAllNewsletterPublications, createNewsletterPublication} =
        useNewsletterPublicationOperations();
    const {notification, showSuccess, showError, hideNotification} =
        useNotification();

    useEffect(() => {
        loadNewsletters(0, pageInfo.size);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadNewsletters = async (page = 0, size = pageInfo.size) => {
        let thisFetchId = undefined;
        try {
            setLoading(true);
            fetchIdRef.current += 1;
            thisFetchId = fetchIdRef.current;

            // cancel in-flight
            if (abortControllerRef.current) {
                try {
                    abortControllerRef.current.abort();
                } catch (e) {
                }
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            const options = {
                signal: controller.signal,
                search: searchQuery || undefined,
                sortField: sortState?.field || undefined,
                sortDir: sortState?.direction || undefined,
                isPublished: publishedOnly || undefined,
            };

            const data = await getAllNewsletterPublications(page, size, options);

            if (fetchIdRef.current === thisFetchId) {
                setNewsletters(data.content || []);
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
            console.error("Error loading newsletters:", error);
            const serverMessage = error?.response?.data?.message || null;
            showError(
                "Erreur de chargement",
                serverMessage || "Impossible de charger les newsletters",
            );
        } finally {
            if (thisFetchId !== undefined && fetchIdRef.current === thisFetchId)
                setLoading(false);
        }
    };

    const handleCreateNewsletter = async () => {
        try {
            await createNewsletterPublication({
                name: "Nouvelle Newsletter",
                title: "Nouvelle Newsletter",
                description: "Description de la newsletter",
                isVisible: false,
            });
            await loadNewsletters();
            showSuccess(
                "Newsletter créée",
                "Une nouvelle newsletter a été créée avec succès",
            );
        } catch (error) {
            console.error("Error creating newsletter:", error);
            showError("Erreur de création", "Impossible de créer la newsletter");
        }
    };

    const handleNewsletterClick = (newsletter) => {
        // Use newsletterId (shared across versions) instead of id (unique per publication)
        router.push(`/newsletters/${newsletter.newsletterId}`);
    };

    // initial sync from URL
    useEffect(() => {
        if (!searchParams) return;
        const q = searchParams.get("search");
        const sortParam = searchParams.get("sort");
        const page = parseInt(searchParams.get("page") || "0", 10);
        const size = parseInt(searchParams.get("size") || "10", 10);
        const pub = searchParams.get("published") === "true";

        if (q) setSearchQuery(q);
        if (sortParam) {
            const [field, dir] = sortParam.split(",");
            setSortState({field: field || null, direction: dir || "asc"});
        }
        setPageInfo((p) => ({
            ...p,
            page: Number.isNaN(page) ? 0 : page,
            size: Number.isNaN(size) ? p.size : size,
        }));
        setPublishedOnly(pub);

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

            const path =
                typeof window !== "undefined"
                    ? window.location.pathname
                    : "/newsletters";
            const url = params.toString() ? `${path}?${params.toString()}` : path;
            router.push(url);
        }, 300);
        return () => {
            if (urlUpdateTimerRef.current) clearTimeout(urlUpdateTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, sortState, pageInfo.page, pageInfo.size, publishedOnly]);

    // reload when search, sort or filter changes (reset to first page)
    useEffect(() => {
        setPageInfo((p) => ({...p, page: 0}));
        loadNewsletters(0, pageInfo.size);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, sortState, publishedOnly]);

    const handleFiltersSearch = useCallback((q) => setSearchQuery(q), []);
    const handleFiltersSort = useCallback((s) => setSortState(s), []);
    const handleFiltersFilter = useCallback(({key, value}) => {
        if (key === "published") {
            setPublishedOnly(Boolean(value));
        }
    }, []);

    const filtersConfig = useMemo(
        () => ({
            fields: [
                {key: "name", label: "Nom", icon: TagIcon},
                {key: "title", label: "Titre", icon: UnderlineIcon},
                {key: "createdAt", label: "Date", icon: CalendarDaysIcon},
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
            ],
            onFilterChange: handleFiltersFilter,
            onClearFilters: () => {
                setPublishedOnly(false);
                setSearchQuery("");
                setSortState({field: null, direction: null});
                setPageInfo((p) => ({...p, page: 0}));
                const params = new URLSearchParams();
                params.set("page", "0");
                params.set("size", String(pageInfo.size));
                const path =
                    typeof window !== "undefined"
                        ? window.location.pathname
                        : "/newsletters";
                const url = params.toString() ? `${path}?${params.toString()}` : path;
                try {
                    router.push(url);
                } catch (e) {
                    try {
                        window.history.replaceState(null, "", url);
                    } catch (_) {
                    }
                }
                loadNewsletters(0, pageInfo.size);
            },
            searchValue: searchQuery,
            sortValue: sortState,
            initialSort: {field: null, direction: null},
            placeholder: "Rechercher une newsletter...",
        }),
        [
            handleFiltersSearch,
            handleFiltersSort,
            searchQuery,
            sortState,
            publishedOnly,
        ],
    );

    const isLoading = loading;

    return (
        <SceneLayout>
            <Title label="Newsletters"/>

            <NewsletterAllVariantAlert/>

            <Utilities
                actions={[
                    {
                        icon: PlusIcon,
                        label: "Nouvelle Newsletter",
                        callback: handleCreateNewsletter,
                        disabled: isLoading,
                    },
                ]}
                filtersConfig={filtersConfig}
            />

            {isLoading ? (
                <div className="mt-4">
                    <LoadingSkeleton variant="card" count={6} showActions={true}/>
                </div>
            ) : (
                <CardList emptyMessage="Aucune newsletter trouvée.">
                    {newsletters.map((newsletter) => (
                        <NewsletterCard
                            key={newsletter.id}
                            newsletter={newsletter}
                            onClick={() => handleNewsletterClick(newsletter)}
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
                onChange={(p) => loadNewsletters(p, pageInfo.size)}
                onPageSizeChange={(newSize) => {
                    setPageInfo((p) => ({...p, size: newSize, page: 0}));
                    loadNewsletters(0, newSize);
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
