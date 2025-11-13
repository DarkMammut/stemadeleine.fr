"use client";

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function Autocomplete({
  value,
  onChange,
  options,
  labelKey = "label",
  valueKey = "value",
  placeholder = "",
  className = "",
  loadOptions, // optional async loader: (query) => Promise<array>
  debounce = 200,
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(options || []);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);
  const requestIdRef = useRef(0);
  const itemsRef = useRef(items);
  const loadingRef = useRef(loading);

  const findOptionByValue = (val) => {
    if (!val) return null;
    return (itemsRef.current || []).find(
      (it) => String(it[valueKey]) === String(val),
    );
  };

  const findOptionByLabel = (lbl) => {
    if (!lbl) return null;
    return (itemsRef.current || []).find(
      (it) =>
        String(it[labelKey] ?? "").toLowerCase() === String(lbl).toLowerCase(),
    );
  };

  const arraysEqualByKey = (a, b, key) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const va = a[i] && (a[i][key] ?? a[i]);
      const vb = b[i] && (b[i][key] ?? b[i]);
      if (va !== vb) return false;
    }
    return true;
  };

  useEffect(() => {
    // update items only if different reference/content to avoid unnecessary renders
    const next = options || [];
    const prev = itemsRef.current;
    if (!arraysEqualByKey(prev, next, valueKey)) {
      itemsRef.current = next;
      setItems(next);
    }
    // sync query with value -> show label for the selected value
    const sel = findOptionByValue(value);
    if (sel) setQuery(String(sel[labelKey] ?? sel[valueKey] ?? ""));
  }, [options]);

  useEffect(() => {
    if (!loadOptions) return;

    // debounce
    // don't trigger loader on empty query by default
    if (!query || String(query).trim().length === 0) {
      // reset to provided options only when changed
      const next = options || [];
      const prev = itemsRef.current;
      if (!arraysEqualByKey(prev, next, valueKey)) {
        itemsRef.current = next;
        setItems(next);
      }
      if (loadingRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const currentRequestId = ++requestIdRef.current;
    timeoutRef.current = setTimeout(async () => {
      if (!loadingRef.current) {
        loadingRef.current = true;
        setLoading(true);
      }
      try {
        const res = await loadOptions(query);
        // ignore if a newer request started
        if (requestIdRef.current !== currentRequestId) return;
        const next = res || [];
        const prev = itemsRef.current;
        if (!arraysEqualByKey(prev, next, valueKey)) {
          itemsRef.current = next;
          setItems(next);
        }
      } catch (err) {
        console.error("Autocomplete load error", err);
      } finally {
        if (requestIdRef.current === currentRequestId && loadingRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    }, debounce);

    return () => clearTimeout(timeoutRef.current);
  }, [query, loadOptions, debounce, options]);

  const filtered = items.filter((it) => {
    const text = String(it[labelKey] ?? it[valueKey] ?? "").toLowerCase();
    return text.includes((query || "").toLowerCase());
  });

  useEffect(() => {
    setHighlight(0);
  }, [open, query]);

  // Fermer le dropdown lorsqu'on clique en dehors
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        // outside click
        // reuse handleBlur logic: close and reset query if needed
        const optByValue = (itemsRef.current || []).find(
          (it) => String(it[valueKey]) === String(value),
        );
        const optByLabel = (itemsRef.current || []).find(
          (it) =>
            String(it[labelKey] ?? "").toLowerCase() ===
            String(query).toLowerCase(),
        );
        if (!optByLabel || String(optByLabel[valueKey]) !== String(value)) {
          if (optByValue)
            setQuery(
              String(optByValue[labelKey] ?? optByValue[valueKey] ?? ""),
            );
          else setQuery("");
        }
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [value, query, valueKey, labelKey]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) selectItem(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectItem = (item) => {
    onChange(item[valueKey]);
    setQuery(String(item[labelKey] ?? item[valueKey] ?? ""));
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // close dropdown and cancel unsaved typed text if it doesn't correspond to current value
    setOpen(false);
    const optByValue = findOptionByValue(value);
    const optByLabel = findOptionByLabel(query);
    // if typed label doesn't match current value, reset to current value label (or empty)
    if (!optByLabel || String(optByLabel[valueKey]) !== String(value)) {
      if (optByValue)
        setQuery(String(optByValue[labelKey] ?? optByValue[valueKey] ?? ""));
      else setQuery("");
    }
  };

  return (
    <div ref={wrapperRef} className={clsx("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query || (value ? String(value) : "")}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-white px-3 py-2 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-gray-400 hover:text-gray-600"
            aria-label="Clear"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-md bg-white border border-gray-200 shadow-lg max-h-56 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">Aucun résultat</div>
          ) : (
            <ul>
              {filtered.map((it, idx) => (
                <li
                  key={it[valueKey] || idx}
                  onMouseDown={(e) => {
                    // mouseDown to prevent blur before click
                    e.preventDefault();
                    selectItem(it);
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={clsx(
                    "cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50",
                    highlight === idx && "bg-indigo-50",
                  )}
                >
                  {it[labelKey] ?? it[valueKey]}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

Autocomplete.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  labelKey: PropTypes.string,
  valueKey: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  loadOptions: PropTypes.func,
  debounce: PropTypes.number,
};

Autocomplete.defaultProps = {
  value: null,
  options: [],
  labelKey: "label",
  valueKey: "value",
  placeholder: "",
  className: "",
  loadOptions: null,
  debounce: 200,
};
