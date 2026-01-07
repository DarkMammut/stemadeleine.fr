"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import dynamic from "next/dynamic";

// Fix pour React 18+ et findDOMNode
if (typeof window !== "undefined") {
    // Polyfill pour findDOMNode si manquant
    const ReactDOM = require("react-dom");
    if (!ReactDOM.findDOMNode) {
        ReactDOM.findDOMNode = (node) => {
            if (node?.nodeType === 1) return node;
            if (node?._reactInternalFiber?.stateNode)
                return node._reactInternalFiber.stateNode;
            if (node?._reactInternals?.stateNode)
                return node._reactInternals.stateNode;
            return node;
        };
    }
}

// Import dynamique sans chargement CSS intégré
const ReactQuill = dynamic(
    () => {
        return import("react-quill-new").then((mod) => {
            return mod.default;
        });
    },
    {
        ssr: false,
        loading: () => (
            <div className="h-32 skeleton rounded flex items-center justify-center">
                <span className="text-gray-500">Chargement éditeur...</span>
            </div>
        ),
    },
);

const RichTextEditor = ({
                            value = "",
                            onChange,
                            placeholder = "Start writing...",
                            height = "200px",
                            disabled = false,
                        }) => {
    const quillRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);
    const [editorContent, setEditorContent] = useState(value);

    useEffect(() => {
        setIsMounted(true);

        // Charger les styles CSS depuis le CDN Quill
        if (typeof window !== "undefined") {
            // Vérifier si les styles ne sont pas déjà chargés
            const existingLink = document.querySelector('link[href*="quill"]');

            if (!existingLink) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
                link.onload = () => {
                    // Quill CSS loaded — no debug logs to avoid console noise
                };
                link.onerror = () => {
                    console.warn("Failed to load Quill CSS from CDN");
                };
                document.head.appendChild(link);
            }
        }
    }, []);

    // Sync external value changes with internal state
    useEffect(() => {
        if (value !== editorContent) {
            setEditorContent(value);
        }
    }, [value]);

    // Handle content changes
    const handleChange = (content, delta, source, editor) => {
        // Always update internal state
        setEditorContent(content);

        // Only trigger onChange if content actually changed and it's a user edit
        if (source === "user" && onChange) {
            onChange(content);
        }
    };

    // Custom toolbar configuration
    const modules = useMemo(
        () => ({
            toolbar: [
                [{header: [1, 2, 3, false]}],
                ["bold", "italic", "underline", "strike"],
                [{list: "ordered"}, {list: "bullet"}],
                [{color: []}, {background: []}],
                ["link"],
                ["blockquote", "code-block"],
                ["clean"],
            ],
            clipboard: {
                matchVisual: false,
            },
            // Removed problematic keyboard bindings that were interfering with space key
        }),
        [],
    );

    const formats = useMemo(
        () => [
            "header",
            "bold",
            "italic",
            "underline",
            "strike",
            "list", // Supporte à la fois "bullet" et "ordered" comme valeurs
            "color",
            "background",
            "link",
            "blockquote",
            "code-block",
        ],
        [],
    );

    // N'afficher l'éditeur que côté client
    if (!isMounted) {
        return (
            <div className="h-32 skeleton rounded flex items-center justify-center">
                <span className="text-gray-500">Chargement éditeur...</span>
            </div>
        );
    }

    return (
        <div className="rich-text-editor">
            <style jsx global>{`
                .ql-editor {
                    min-height: ${height};
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #374151 !important;
                    background-color: white !important;
                    white-space: pre-wrap; /* Preserve spaces and line breaks */
                }

                .ql-toolbar {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    border-bottom: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    border-color: #e5e7eb !important;
                }

                .ql-container {
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    font-family: inherit;
                    border: 1px solid #e5e7eb;
                    border-color: #e5e7eb !important;
                    background-color: white !important;
                }

                .ql-editor.ql-blank::before {
                    color: #9ca3af !important;
                    font-style: italic;
                }

                .ql-editor p {
                    margin-bottom: 1em;
                    color: #374151 !important;
                }

                .ql-editor h1,
                .ql-editor h2,
                .ql-editor h3,
                .ql-editor h4,
                .ql-editor h5,
                .ql-editor h6 {
                    margin-bottom: 0.5em;
                    margin-top: 1em;
                    color: #111827 !important;
                    font-weight: 600;
                }

                .ql-editor ul,
                .ql-editor ol {
                    margin-bottom: 1em;
                    color: #374151 !important;
                }

                .ql-editor li {
                    color: #374151 !important;
                }

                .ql-editor blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1rem;
                    margin-left: 0;
                    margin-right: 0;
                    background-color: #f9fafb;
                    padding: 1rem;
                    border-radius: 4px;
                    color: #4b5563 !important;
                    font-style: italic;
                }

                .ql-editor a {
                    color: #3b82f6 !important;
                    text-decoration: underline;
                }

                .ql-editor strong {
                    color: #111827 !important;
                    font-weight: 600;
                }

                .ql-editor em {
                    color: #374151 !important;
                    font-style: italic;
                }

                /* Fix pour assurer la visibilité du texte */
                .ql-editor * {
                    color: inherit !important;
                }

                /* Override any potential white text */
                .ql-editor span:not([style*="color"]) {
                    color: #374151 !important;
                }

                /* Ensure cursor is visible */
                .ql-editor .ql-cursor {
                    border-left: 1px solid #374151;
                }

                /* Fix toolbar icons color */
                .ql-toolbar .ql-picker-label,
                .ql-toolbar .ql-picker-item,
                .ql-toolbar button {
                    color: #374151 !important;
                }

                .ql-toolbar button:hover {
                    color: #111827 !important;
                }

                /* Fix for space handling */
                .ql-editor {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                /* Ensure proper text input behavior */
                .ql-editor[contenteditable="true"] {
                    -webkit-user-select: text;
                    -moz-user-select: text;
                    -ms-user-select: text;
                    user-select: text;
                    outline: none;
                }
            `}</style>

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={editorContent}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={disabled}
                style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                }}
            />
        </div>
    );
};

export default RichTextEditor;
