"use client";

import {useState} from "react";
import {SUPPORTED_LOCALES, useTranslation} from "@/i18n/I18nContext";

function FrFlag({className}) {
    return (
        <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
            <rect width="1" height="2" fill="#0055A4"/>
            <rect x="1" width="1" height="2" fill="#FFFFFF"/>
            <rect x="2" width="1" height="2" fill="#EF4135"/>
        </svg>
    );
}

function GbFlag({className}) {
    return (
        <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
            <rect width="60" height="30" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2"/>
            <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10"/>
            <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
    );
}

const FLAGS = {fr: FrFlag, en: GbFlag};

export default function LanguageSwitcher() {
    const {locale, setLocale, t} = useTranslation();
    const [open, setOpen] = useState(false);
    const others = SUPPORTED_LOCALES.filter((l) => l !== locale);
    const Current = FLAGS[locale];

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
        >
            <button
                type="button"
                aria-label={`${t("header.language")}: ${t(`languages.${locale}`)}`}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex items-center rounded-full p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <Current className="w-7 h-5 rounded-xs ring-1 ring-white/30"/>
            </button>
            {open && (
                <div className="absolute right-0 top-full z-10 pt-1">
                    <div className="rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5">
                        {others.map((l) => {
                            const Flag = FLAGS[l];
                            return (
                                <button
                                    key={l}
                                    type="button"
                                    title={t(`languages.${l}`)}
                                    aria-label={t(`languages.${l}`)}
                                    onClick={() => {
                                        setLocale(l);
                                        setOpen(false);
                                    }}
                                    className="flex items-center rounded p-1.5 hover:bg-gray-100 cursor-pointer"
                                >
                                    <Flag className="w-7 h-5 rounded-xs ring-1 ring-black/10"/>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
