"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  FunnelIcon as FunnelOutline,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { FunnelIcon as FunnelSolid } from '@heroicons/react/24/solid';
import IconButton from './IconButton';
import SearchBar from './SearchBar';
import Select from './Select';

/**
 * Filters composant réutilisable
 * Props:
 * - fields: Array<{ key: string, label: string }> : champs triables
 * - onSortChange: function({ field: string|null, direction: 'asc'|'desc'|null })
 * - onSearch: function(searchValue)
 * - initialSort: { field, direction }
 * - placeholder: placeholder for search
 * - className: classes supplémentaires
 */
export default function Filters({
  fields = [],
  onSortChange,
  onSearch,
  initialSort = { field: null, direction: null },
  initialSearch = "",
  // optional controlled values
  searchValue,
  sortValue,
  // new: filter items (array of { key, label, type: 'toggle', value })
  filterItems = [],
  onFilterChange,
  // optional callback to clear filters in parent
  onClearFilters,
  label = "Filtres",
  placeholder = "Search",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(() =>
    searchValue !== undefined ? searchValue : initialSearch || "",
  );
  const [sort, setSort] = useState(() =>
    sortValue !== undefined ? sortValue : initialSort,
  );
  // collapsed state per group (true = collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const isSortControlled = sortValue !== undefined;
  // for controlled mode: queue sort updates and call parent from effect to avoid updates during render
  const pendingSortRef = useRef(null);
  const [pendingSortTick, setPendingSortTick] = useState(0);
  const containerRef = useRef(null);

  // debounce timer id
  const debounceRef = useRef(null);

  // Initialize collapsedGroups when filterItems change: default collapsed unless any item in group is selected
  useEffect(() => {
    if (!filterItems || !filterItems.length) return;
    const groups = filterItems.reduce((acc, fi) => {
      const g = fi.group || "Autres";
      acc[g] = acc[g] || [];
      acc[g].push(fi);
      return acc;
    }, {});
    setCollapsedGroups((prev) => {
      const next = { ...prev };
      Object.keys(groups).forEach((g) => {
        const hasSelected = groups[g].some(
          (fi) => fi.type === "toggle" && fi.value === true,
        );
        if (hasSelected) {
          // if any item selected, ensure group is expanded
          next[g] = false;
        } else if (prev[g] === undefined) {
          // otherwise, if not set before, default to collapsed
          next[g] = true;
        }
      });
      return next;
    });
  }, [filterItems]);

  // helper: compute groups map { groupLabel: [items] }
  const computeGroups = () => {
    if (!filterItems || !filterItems.length) return {};
    return filterItems.reduce((acc, fi) => {
      const g = fi.group || "Autres";
      acc[g] = acc[g] || [];
      acc[g].push(fi);
      return acc;
    }, {});
  };

  // reset collapsedGroups according to current filterItems: collapsed unless group has a selected filter
  const resetCollapsedGroups = () => {
    const groups = computeGroups();
    const next = {};
    Object.entries(groups).forEach(([g, items]) => {
      const hasSelected = items.some(
        (fi) => fi.type === "toggle" && fi.value === true,
      );
      next[g] = !hasSelected; // collapsed if no selection
    });
    setCollapsedGroups(next);
  };

  const toggleGroup = (groupLabel) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  // Render helper for filter section (groups or flat list)
  const renderFilterSection = () => {
    const groups = computeGroups();
    const hasGroups =
      Object.keys(groups).length > 0 && filterItems.some((fi) => fi.group);

    if (hasGroups) {
      return (
        <div className="flex flex-col gap-3">
          {Object.entries(groups).map(([groupLabel, items]) => (
            <div key={groupLabel}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[11px] font-semibold text-gray-500">
                  {groupLabel}
                  {(() => {
                    const activeCount = items.filter(
                      (fi) => fi.type === "toggle" && fi.value,
                    ).length;
                    return activeCount > 0 ? ` (${activeCount})` : "";
                  })()}
                </div>
                <button
                  type="button"
                  onClick={() => toggleGroup(groupLabel)}
                  aria-expanded={!collapsedGroups[groupLabel]}
                  className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {collapsedGroups[groupLabel] ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronUpIcon className="h-4 w-4" />
                  )}
                </button>
              </div>

              {!collapsedGroups[groupLabel] && (
                <div className="flex flex-col gap-2">
                  {items.map((fi) => {
                    if (fi.type === "toggle") {
                      return (
                        <label
                          key={fi.key}
                          className="inline-flex items-center px-2 py-1 gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(fi.value)}
                            onChange={(e) =>
                              onFilterChange &&
                              onFilterChange({
                                key: fi.key,
                                value: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                          />
                          <span className="text-gray-700">{fi.label}</span>
                        </label>
                      );
                    }
                    if (fi.type === "select") {
                      const val = fi.value == null ? "" : fi.value;
                      return (
                        <div key={fi.key} className="px-2 py-1">
                          <div className="text-xs text-gray-500 mb-1">
                            {fi.label}
                          </div>
                          <Select
                            value={val}
                            options={fi.options || []}
                            placeholder={fi.placeholder || "Tous"}
                            onValueChange={(v) =>
                              onFilterChange &&
                              onFilterChange({ key: fi.key, value: v || null })
                            }
                            className="w-full"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // flat list (no groups)
    return (
      <div className="flex flex-col gap-2">
        {filterItems.map((fi) => {
          if (fi.type === "toggle") {
            return (
              <label
                key={fi.key}
                className="inline-flex items-center px-2 py-1 gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Boolean(fi.value)}
                  onChange={(e) =>
                    onFilterChange &&
                    onFilterChange({ key: fi.key, value: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-gray-700">{fi.label}</span>
              </label>
            );
          }
          if (fi.type === "select") {
            const val = fi.value == null ? "" : fi.value;
            return (
              <div key={fi.key} className="px-2 py-1">
                <div className="text-xs text-gray-500 mb-1">{fi.label}</div>
                <Select
                  value={val}
                  options={fi.options || []}
                  placeholder={fi.placeholder || "Tous"}
                  onValueChange={(v) =>
                    onFilterChange &&
                    onFilterChange({ key: fi.key, value: v || null })
                  }
                  className="w-full"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  useEffect(() => {
    // fermer au clic en dehors
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    // Debounce calls to onSearch to avoid flooding parent with every keystroke
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // sync when parent provides controlled values
  useEffect(() => {
    if (searchValue !== undefined && searchValue !== search) {
      setSearch(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    if (
      sortValue !== undefined &&
      (sortValue.field !== sort.field || sortValue.direction !== sort.direction)
    ) {
      setSort(sortValue);
    }
  }, [sortValue]);

  // notify parent when internal sort changes only in uncontrolled mode
  useEffect(() => {
    if (!isSortControlled && onSortChange) {
      const next = sort || { field: null, direction: null };
      const t = setTimeout(() => onSortChange(next), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // in controlled mode, flush any pending sort changes to parent from effect (post-render)
  useEffect(() => {
    if (isSortControlled && pendingSortRef.current && onSortChange) {
      const next = pendingSortRef.current;
      pendingSortRef.current = null;
      onSortChange(next);
    }
  }, [isSortControlled, pendingSortTick]);

  // override toggleOpen: when opening, reset groups to default collapsed/expanded state
  const handleToggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (next) {
        // opening: reset groups to default
        resetCollapsedGroups();
      }
      return next;
    });
  };

  const handleFieldClick = (fieldKey) => {
    if (isSortControlled) {
      // controlled mode: compute next and notify parent directly
      const prev = sortValue || { field: null, direction: null };
      let next;
      if (prev.field !== fieldKey) next = { field: fieldKey, direction: "asc" };
      else
        next = {
          field: fieldKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      // queue the change and trigger effect to flush it after render
      pendingSortRef.current = next;
      setPendingSortTick((t) => t + 1);
      // do not set internal state in controlled mode
      return;
    }

    // uncontrolled mode: use internal state and effects
    setSort((prev) => {
      if (prev.field !== fieldKey) {
        return { field: fieldKey, direction: "asc" };
      }
      const nextDir = prev.direction === "asc" ? "desc" : "asc";
      return { field: fieldKey, direction: nextDir };
    });
  };

  const renderIcon = (fieldKey) => {
    if (sort.field !== fieldKey)
      return <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />;
    const isAsc = sort.direction === "asc";
    return (
      <div className="flex items-center">
        <span className="text-[10px] leading-none text-gray-500 mr-1">
          {isAsc ? "a-z" : "z-a"}
        </span>
        {isAsc ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-600" />
        )}
      </div>
    );
  };

  // Clear current sort (déclarée comme function pour être hoistée et éviter ReferenceError dans certains bundles)
  function clearSort() {
    if (isSortControlled) {
      // enqueue cleared sort for parent flush (effect will call onSortChange)
      pendingSortRef.current = { field: null, direction: null };
      setPendingSortTick((t) => t + 1);
      return;
    }
    // uncontrolled: update internal state (effects will notify parent)
    setSort({ field: null, direction: null });
  }

  // debug: log existence of clearSort to help diagnose runtime ReferenceError
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug("Filters: clearSort type ->", typeof clearSort);
    } catch (e) {
      // ignore
    }
  }, []);

  // compute number of active filters: toggles true + search present
  const activeFiltersCount = (() => {
    let c = 0;
    if (filterItems && filterItems.length) {
      filterItems.forEach((fi) => {
        if (fi.type === "toggle" && fi.value) c += 1;
      });
    }
    if (search) c += search.trim() ? 1 : 0;
    // count tri as active filter as well
    if (sort && sort.field) c += 1;
    return c;
  })();

  // number of active filters (toggles + search) without counting sort
  const filtersActiveCount = (() => {
    let c = 0;
    if (filterItems && filterItems.length) {
      filterItems.forEach((fi) => {
        if (fi.type === "toggle" && fi.value) c += 1;
      });
    }
    if (search) c += search.trim() ? 1 : 0;
    return c;
  })();

  // Clear all filters: prefer parent handler if provided
  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
      // also reset local search
      setSearch("");
      resetCollapsedGroups();
      return;
    }
    // otherwise, uncheck all toggles and clear search
    if (onFilterChange && filterItems && filterItems.length) {
      filterItems.forEach((fi) => {
        if (fi.type === "toggle" && fi.value) {
          try {
            onFilterChange({ key: fi.key, value: false });
          } catch (e) {
            // ignore errors from parent
          }
        }
      });
    }
    // clear search input (debounced onSearch will be called)
    setSearch("");
    // reset collapsed groups to default
    resetCollapsedGroups();
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={containerRef}
    >
      <div className="relative inline-flex items-center">
        <IconButton
          icon={activeFiltersCount > 0 ? FunnelSolid : FunnelOutline}
          variant={activeFiltersCount > 0 ? "primary" : "outline"}
          size="md"
          onClick={handleToggleOpen}
          hoverExpand={true}
          aria-haspopup="true"
          aria-expanded={open}
        >
          {label}
        </IconButton>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
            {activeFiltersCount}
          </span>
        )}
      </div>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={placeholder}
            />

            <div className="mt-3">
              {/* Filters section (toggles / small controls) */}
              {filterItems && filterItems.length > 0 && (
                <div
                  className="mb-3"
                  role="region"
                  aria-labelledby="filters-heading"
                >
                  <div
                    id="filters-heading"
                    className="flex items-center justify-between gap-2 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <FunnelOutline className="h-4 w-4 text-gray-500" />
                      <div className="text-xs font-semibold text-gray-500">
                        Filtres
                      </div>
                    </div>
                    {filtersActiveCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        aria-label="Effacer les filtres"
                      >
                        <XMarkIcon className="h-3 w-3" />
                        <span>Effacer</span>
                      </button>
                    )}
                  </div>
                  {/* If items are grouped (have a `group` prop), render groups, else render flat list */}
                  {renderFilterSection()}
                </div>
              )}
              {/* visual separator between Filters and Sort (only when both sections exist) */}
              {filterItems &&
                filterItems.length > 0 &&
                fields &&
                fields.length > 0 && (
                  <div
                    className="border-t border-gray-100 my-3"
                    role="separator"
                    aria-hidden="true"
                  />
                )}

              <div
                className="flex items-center justify-between mb-2"
                role="region"
                aria-labelledby="sort-heading"
              >
                <div className="flex items-center gap-2">
                  <ChevronUpDownIcon className="h-4 w-4 text-gray-500" />
                  <div
                    id="sort-heading"
                    className="text-xs font-semibold text-gray-500"
                  >
                    Tri
                  </div>
                </div>
                {sort && sort.field && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof clearSort === "function") clearSort();
                    }}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    aria-label="Effacer le tri"
                  >
                    <XMarkIcon className="h-3 w-3" />
                    <span>Effacer</span>
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {fields.map((f) => {
                  const FieldIcon = f.icon;
                  return (
                    <button
                      key={f.key}
                      className={`flex items-center justify-between w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-50 cursor-pointer ${
                        sort.field === f.key ? "font-medium" : "text-gray-600"
                      }`}
                      onClick={() => {
                        handleFieldClick(f.key);
                        // after choosing a sort field, keep the popover open so user can change direction
                      }}
                      // indicate it's clickable
                      aria-label={`Sort by ${f.label}`}
                      title={`Trier par ${f.label}`}
                    >
                      <div className="flex items-center">
                        {FieldIcon && (
                          <FieldIcon className="h-4 w-4 text-gray-500 mr-2" />
                        )}
                        <span>{f.label}</span>
                      </div>
                      <span className="ml-2">{renderIcon(f.key)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
