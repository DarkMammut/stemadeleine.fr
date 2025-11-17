"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { usePaymentOperations } from "@/hooks/usePaymentOperations";
import CardList from "@/components/ui/CardList";
import PaymentCard from "@/components/PaymentCard";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import PaymentFormModal from "@/components/PaymentFormModal";
import SceneLayout from "@/components/ui/SceneLayout";
import { useAxiosClient } from "@/utils/axiosClient";
import Pagination from "@/components/ui/Pagination";

export default function Payments() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const axios = useAxiosClient();
  const [payments, setPayments] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { getAllPayments, createPayment } = usePaymentOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const [enums, setEnums] = useState({ status: [], type: [] });
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState({ field: null, direction: null });

  // read initial state from URL params (if any) then fetch enums and data
  useEffect(() => {
    // parse search params (useSearchParams returns a URLSearchParams-like object)
    const initStatuses =
      searchParams && searchParams.getAll ? searchParams.getAll("status") : [];
    const initTypes =
      searchParams && searchParams.getAll ? searchParams.getAll("type") : [];
    const initSortField = searchParams ? searchParams.get("sortField") : null;
    const initSortDir = searchParams ? searchParams.get("sortDir") : null;
    const initSearch = searchParams ? searchParams.get("search") : null;
    const initPage = parseInt(searchParams?.get("page") || "0", 10) || 0;
    const initSize = parseInt(searchParams?.get("size") || "10", 10) || 10;

    setSelectedStatuses(initStatuses || []);
    setSelectedTypes(initTypes || []);
    setSearchQuery(initSearch || "");
    setSortValue({
      field: initSortField || null,
      direction: initSortDir || null,
    });
    setPageInfo((p) => ({ ...p, page: initPage, size: initSize }));

    // fetch enums and initial page using parsed params
    (async () => {
      try {
        const res = await axios.get("/api/payments/enums");
        setEnums(res.data || { status: [], type: [] });
      } catch (err) {
        // continue even if enums fail
      }

      await loadPayments(initPage, initSize, {
        statuses: initStatuses,
        types: initTypes,
        sortField: initSortField,
        sortDir: initSortDir,
        search: initSearch,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ref to skip effect on initial mount (we already loaded data in mount effect)
  const mountedRef = useRef(false);

  // effect: when filters/tri/pagination change, update URL and reload (runs after render)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    // update URL and reload using current state
    updateUrlFromState(
      pageInfo.page,
      pageInfo.size,
      selectedStatuses,
      selectedTypes,
      sortValue,
      searchQuery,
    );
    loadPayments(pageInfo.page, pageInfo.size, {
      statuses: selectedStatuses,
      types: selectedTypes,
      sortField: sortValue.field,
      sortDir: sortValue.direction,
      search: searchQuery,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedStatuses,
    selectedTypes,
    sortValue,
    pageInfo.page,
    pageInfo.size,
    searchQuery,
  ]);

  // helper to update URL (replace history entry) from state/overrides
  const updateUrlFromState = (
    page = pageInfo.page,
    size = pageInfo.size,
    statuses = selectedStatuses,
    types = selectedTypes,
    sort = sortValue,
    search = null,
  ) => {
    const params = new URLSearchParams();
    if (typeof page === "number") params.set("page", String(page));
    if (typeof size === "number") params.set("size", String(size));
    if (search) params.set("search", search);
    if (sort && sort.field) {
      params.set("sortField", sort.field);
      if (sort.direction) params.set("sortDir", sort.direction);
    }
    (statuses || []).forEach((s) => params.append("status", s));
    (types || []).forEach((t) => params.append("type", t));

    const q = params.toString();
    const url = q ? `${pathname}?${q}` : pathname;
    // use replace to avoid adding a history entry on each toggle
    // defer navigation to avoid updating Router during render (React error)
    setTimeout(() => {
      try {
        router.push(url);
      } catch (e) {
        // fallback if router.replace fails for some reason
        try {
          window.history.replaceState(null, "", url);
        } catch (err) {
          // nothing else we can do
        }
      }
    }, 0);
  };

  const buildFilterItems = useCallback(() => {
    const items = [];
    // statuses: key like status:PAID
    (enums.status || []).forEach((s) => {
      items.push({
        key: `status:${s}`,
        label: `Statut: ${s}`,
        type: "toggle",
        value: selectedStatuses.includes(s),
        group: "Statuts",
      });
    });
    // types
    (enums.type || []).forEach((t) => {
      items.push({
        key: `type:${t}`,
        label: `Type: ${t}`,
        type: "toggle",
        value: selectedTypes.includes(t),
        group: "Types",
      });
    });
    return items;
  }, [enums, selectedStatuses, selectedTypes]);

  const fields = [
    { key: "paymentDate", label: "Date" },
    { key: "amount", label: "Montant" },
  ];

  // loadPayments accepts optional overrides to avoid races with setState
  const loadPayments = async (
    page = 0,
    size = pageInfo.size,
    overrides = {},
  ) => {
    try {
      setLoading(true);
      const options = {
        sortField:
          overrides.sortField !== undefined
            ? overrides.sortField
            : sortValue.field,
        sortDir:
          overrides.sortDir !== undefined
            ? overrides.sortDir
            : sortValue.direction,
        statuses:
          overrides.statuses !== undefined
            ? overrides.statuses
            : selectedStatuses,
        types: overrides.types !== undefined ? overrides.types : selectedTypes,
        search: overrides.search !== undefined ? overrides.search : searchQuery,
      };
      const data = await getAllPayments(page, size, options);
      setPayments(data.content || []);
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
      console.error("Erreur lors du chargement des paiements:", error);
      showError("Erreur de chargement", "Impossible de charger les paiements");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = ({ key, value }) => {
    // key format: status:XXX or type:YYY
    const [kind, val] = key.split(":");
    if (kind === "status") {
      // just update state and reset to first page; effect will handle URL + reload
      setSelectedStatuses((prev) => {
        const next = value
          ? Array.from(new Set([...prev, val]))
          : prev.filter((s) => s !== val);
        setPageInfo((p) => ({ ...p, page: 0 }));
        return next;
      });
    } else if (kind === "type") {
      setSelectedTypes((prev) => {
        const next = value
          ? Array.from(new Set([...prev, val]))
          : prev.filter((t) => t !== val);
        setPageInfo((p) => ({ ...p, page: 0 }));
        return next;
      });
    }
  };

  const handleSortChange = (nextSort) => {
    const ns = nextSort || { field: null, direction: null };
    setSortValue(ns);
    // reset to page 0
    setPageInfo((p) => ({ ...p, page: 0 }));
    // effect will pick up the changed sortValue and pageInfo and reload
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      setIsCreating(true);
      await createPayment(paymentData);
      await loadPayments(pageInfo.page, pageInfo.size);
      setIsModalOpen(false);
      showSuccess("Paiement créé", "Le paiement a été créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      showError("Erreur de création", "Impossible de créer le paiement");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/payments/import");
      await loadPayments(pageInfo.page, pageInfo.size);
      showSuccess(
        "Import HelloAsso terminé",
        "Les paiements ont été importés avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      showError(
        "Erreur d'import",
        "Impossible d'importer les paiements HelloAsso",
      );
    }
  };

  const handlePaymentClick = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  /** prepare filtersConfig via useMemo to keep stable reference */
  const filtersConfig = useMemo(
    () => ({
      fields,
      onSortChange: handleSortChange,
      sortValue,
      filterItems: buildFilterItems(),
      onFilterChange: handleFilterChange,
      onSearch: (q) => setSearchQuery(q),
      searchValue: searchQuery,
      onClearFilters: () => {
        setSelectedStatuses([]);
        setSelectedTypes([]);
        setSearchQuery("");
        setPageInfo((p) => ({ ...p, page: 0 }));
        updateUrlFromState(
          0,
          pageInfo.size,
          [],
          [],
          { field: null, direction: null },
          null,
        );
        loadPayments(0, pageInfo.size, {
          statuses: [],
          types: [],
          sortField: null,
          sortDir: null,
          search: "",
        });
      },
      label: "Filtres",
      placeholder: "Rechercher...",
    }),
    [
      fields,
      handleSortChange,
      sortValue,
      buildFilterItems,
      handleFilterChange,
      searchQuery,
      pageInfo.size,
    ],
  );

  return (
    <SceneLayout>
      <Title label="Paiements" />

      <div className="flex items-center justify-between gap-2">
        <Utilities
          actions={[
            {
              icon: PlusIcon,
              label: "Nouveau Paiement",
              callback: () => setIsModalOpen(true),
            },
            {
              variant: "refresh",
              label: "Actualiser HelloAsso",
              callback: handleImportHelloAsso,
              hoverExpand: true,
            },
          ]}
          filtersConfig={filtersConfig}
        />
      </div>

      {loading ? (
        <div className="mt-4">
          <LoadingSkeleton variant="card" count={6} showActions={true} />
        </div>
      ) : (
        <CardList emptyMessage="Aucun paiement trouvé.">
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onClick={() => handlePaymentClick(payment)}
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
        onChange={(p) => {
          setPageInfo((prev) => ({ ...prev, page: p }));
          // effect will handle update URL + reload
        }}
        onPageSizeChange={(newSize) => {
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
          // effect will handle update URL + reload
        }}
      />

      <PaymentFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePayment}
        isLoading={isCreating}
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
