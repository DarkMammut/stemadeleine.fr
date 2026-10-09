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
import { useTranslation } from "@/i18n/I18nContext";

export default function Payments() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const axios = useAxiosClient();
  const { t } = useTranslation();
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

  const translateEnum = useCallback(
    (group, value) => {
      if (!value) return "";
      const key = `payments.enums.${group}.${String(value).toUpperCase()}`;
      const translated = t(key);
      return translated === key ? value : translated;
    },
    [t],
  );

  useEffect(() => {
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

    (async () => {
      try {
        const res = await axios.get("/api/payments/enums");
        setEnums(res.data || { status: [], type: [] });
      } catch (err) {}

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

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
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
    setTimeout(() => {
      try {
        router.push(url);
      } catch (e) {
        try {
          window.history.replaceState(null, "", url);
        } catch (err) {}
      }
    }, 0);
  };

  const buildFilterItems = useCallback(() => {
    const items = [];
    (enums.status || []).forEach((status) => {
      items.push({
        key: `status:${status}`,
        label: `${t("payments.filterStatusPrefix")}: ${translateEnum("status", status)}`,
        type: "toggle",
        value: selectedStatuses.includes(status),
        group: t("payments.groups.statuses"),
      });
    });
    (enums.type || []).forEach((type) => {
      items.push({
        key: `type:${type}`,
        label: `${t("payments.filterTypePrefix")}: ${translateEnum("type", type)}`,
        type: "toggle",
        value: selectedTypes.includes(type),
        group: t("payments.groups.types"),
      });
    });
    return items;
  }, [enums, selectedStatuses, selectedTypes, t, translateEnum]);

  const fields = useMemo(
    () => [
      { key: "paymentDate", label: t("payments.fields.paymentDate") },
      { key: "amount", label: t("payments.fields.amount") },
    ],
    [t],
  );

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
      showError(t("payments.loadErrorTitle"), t("payments.loadErrorMessage"));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = ({ key, value }) => {
    const [kind, val] = key.split(":");
    if (kind === "status") {
      setSelectedStatuses((prev) => {
        const next = value
          ? Array.from(new Set([...prev, val]))
          : prev.filter((status) => status !== val);
        setPageInfo((p) => ({ ...p, page: 0 }));
        return next;
      });
    } else if (kind === "type") {
      setSelectedTypes((prev) => {
        const next = value
          ? Array.from(new Set([...prev, val]))
          : prev.filter((type) => type !== val);
        setPageInfo((p) => ({ ...p, page: 0 }));
        return next;
      });
    }
  };

  const handleSortChange = (nextSort) => {
    const ns = nextSort || { field: null, direction: null };
    setSortValue(ns);
    setPageInfo((p) => ({ ...p, page: 0 }));
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      setIsCreating(true);
      await createPayment(paymentData);
      await loadPayments(pageInfo.page, pageInfo.size);
      setIsModalOpen(false);
      showSuccess(
        t("payments.createSuccessTitle"),
        t("payments.createSuccessMessage"),
      );
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      showError(
        t("payments.createErrorTitle"),
        t("payments.createErrorMessage"),
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/payments/import");
      await loadPayments(pageInfo.page, pageInfo.size);
      showSuccess(
        t("payments.importSuccessTitle"),
        t("payments.importSuccessMessage"),
      );
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      showError(t("payments.importErrorTitle"), t("payments.importErrorMessage"));
    }
  };

  const handlePaymentClick = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

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
      label: t("payments.filtersLabel"),
      placeholder: t("payments.searchPlaceholder"),
    }),
    [
      fields,
      sortValue,
      buildFilterItems,
      searchQuery,
      pageInfo.size,
      t,
    ],
  );

  return (
    <SceneLayout>
      <Title label={t("payments.title")} />

      <div className="flex items-center justify-between gap-2">
        <Utilities
          actions={[
            {
              icon: PlusIcon,
              label: t("payments.newPayment"),
              callback: () => setIsModalOpen(true),
            },
            {
              variant: "refresh",
              label: t("payments.refreshHelloAsso"),
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
        <CardList emptyMessage={t("payments.empty")}>
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
        }}
        onPageSizeChange={(newSize) => {
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
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
