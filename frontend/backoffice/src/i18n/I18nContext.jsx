"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import fr from "./locales/fr/index";
import en from "./locales/en/index";

export const DEFAULT_LOCALE = "fr";
export const SUPPORTED_LOCALES = ["fr", "en"];
const STORAGE_KEY = "backoffice.locale";
const MESSAGES = {fr, en};

const I18nContext = createContext(null);

function resolve(messages, key) {
    return key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), messages);
}

export function I18nProvider({children}) {
    const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

    // Read the stored locale after mount to avoid hydration mismatches
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && SUPPORTED_LOCALES.includes(stored)) setLocaleState(stored);
        } catch (e) {
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = useCallback((next) => {
        if (!SUPPORTED_LOCALES.includes(next)) return;
        setLocaleState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
        }
    }, []);

    const t = useCallback((key) => {
        const value = resolve(MESSAGES[locale], key) ?? resolve(MESSAGES[DEFAULT_LOCALE], key);
        return typeof value === "string" ? value : key;
    }, [locale]);

    const value = useMemo(() => ({locale, setLocale, t}), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useTranslation must be used within an I18nProvider");
    return ctx;
}
