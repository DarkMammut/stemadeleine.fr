"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  name = "search",
  className = "",
  // optional: function(query) => Promise<array of suggestion items>
  // suggestion item: { id, title, subtitle?, url?, type? }
  fetchSuggestions,
  // called when user hits Enter without selecting a suggestion
  onSubmit,
  // called when user selects a suggestion: onSelect(item)
  onSelect,
  // enable/disable suggestions explicitly
  enableSuggestions = !!fetchSuggestions,
  ...props
}) {
  // onChange attend la nouvelle valeur pour simplifier l'utilisation
  // support controlled (value) ou non (lorsque value === undefined)
  const [localValue, setLocalValue] = useState(
    value === undefined ? "" : value,
  );

  useEffect(() => {
    if (value !== undefined) setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    if (onChange) onChange(v);
    if (value === undefined) setLocalValue(v);
  };

  const inputRef = useRef(null);

  const handleClear = () => {
    if (onChange) onChange("");
    if (value === undefined) setLocalValue("");
    try {
      inputRef.current?.focus();
    } catch (e) {}
  };

  // suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef(null);

  const getQueryValue = () => (value === undefined ? localValue : value || "");

  const runFetch = useCallback(
    async (q) => {
      if (!fetchSuggestions || !q) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      try {
        const res = await fetchSuggestions(q);
        setSuggestions(Array.isArray(res) ? res : []);
        setOpen(true);
        setHighlight(-1);
      } catch (e) {
        setSuggestions([]);
        setOpen(false);
      }
    },
    [fetchSuggestions],
  );

  // debounce effect when query changes
  useEffect(() => {
    if (!enableSuggestions) return;
    const q = getQueryValue();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runFetch(q), 260);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue, value, enableSuggestions, runFetch]);

  // close on outside click
  useEffect(() => {
    const onOutside = (e) => {
      if (!inputRef.current) return;
      if (inputRef.current.contains(e.target)) return;
      setOpen(false);
      setHighlight(-1);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const submitQuery = (q) => {
    if (onSubmit) return onSubmit(q);
    // default does nothing; parent can navigate
    return null;
  };

  const handleSelect = (item) => {
    if (onSelect) return onSelect(item);
    // fallback: if item.url provided, navigate may be handled by parent; otherwise do nothing
    return null;
  };

  const onKeyDown = (e) => {
    if (!enableSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      const q = getQueryValue();
      if (open && highlight >= 0 && suggestions[highlight]) {
        e.preventDefault();
        handleSelect(suggestions[highlight]);
        setOpen(false);
        return;
      }
      // submit
      submitQuery(q);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div className={`relative grid w-full grid-cols-1 ${className}`}>
      <input
        ref={inputRef}
        name={name}
        placeholder={placeholder}
        // value controlled/uncontrolled
        value={value === undefined ? localValue : value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        aria-autocomplete={enableSuggestions ? "list" : undefined}
        aria-expanded={enableSuggestions ? open : undefined}
        className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pr-10 pl-10 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        {...props}
      />

      <MagnifyingGlassIcon
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400"
      />

      {/* Clear button */}
      {onChange && (value || localValue) ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="col-start-1 row-start-1 justify-self-end mr-2 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      ) : null}

      {/* suggestions dropdown */}
      {enableSuggestions && open && suggestions && suggestions.length > 0 ? (
        <ul
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 z-50 mt-10 max-h-64 overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5"
        >
          {suggestions.map((it, idx) => (
            <li
              key={it.id ?? `${it.type}-${idx}`}
              role="option"
              aria-selected={highlight === idx}
              onMouseDown={(e) => {
                // prevent blur before click, then perform selection immediately
                e.preventDefault();
                handleSelect(it);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlight(idx)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${highlight === idx ? "bg-gray-100" : ""}`}
            >
              <div className="text-sm font-medium text-gray-900">
                {it.title || it.label}
              </div>
              {it.subtitle ? (
                <div className="text-xs text-gray-500">{it.subtitle}</div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
