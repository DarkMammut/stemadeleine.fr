"use client";

import React, {useRef, useState} from 'react';
import {ArrowDownTrayIcon, DocumentIcon, TrashIcon, XMarkIcon} from '@heroicons/react/24/outline';
import IconButton from '@/components/ui/IconButton';
import Panel from '@/components/ui/Panel';
import Notification from '@/components/ui/Notification';
import {useNotification} from '@/hooks/useNotification';
import {useAxiosClient} from '@/utils/axiosClient';
import PropTypes from 'prop-types';

/**
 * PdfPickerWrapper - Zone de drag & drop ou sélection de fichier PDF
 */
const PdfPickerWrapper = ({onUploadComplete, disabled = false}) => {
    const axios = useAxiosClient();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const handleFileInputChange = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file) => {
        if (file.type !== 'application/pdf') {
            alert('Seuls les fichiers PDF sont acceptés.');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post('/api/media/upload', formData, {
                onUploadProgress: (event) => {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setProgress(percent);
                },
            });

            if (onUploadComplete) {
                onUploadComplete(res.data);
            }
        } catch (err) {
            console.error("Erreur lors de l'upload du PDF :", err);
            alert("Erreur lors de l'upload du fichier PDF");
        } finally {
            setUploading(false);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
            />

            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-all
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'}
                    ${uploading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                `}
                onClick={!uploading && !disabled ? handleFileSelect : undefined}
            >
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400"/>
                <p className="mt-2 text-sm text-gray-700 font-medium">
                    {uploading
                        ? 'Upload en cours...'
                        : isDragging
                            ? 'Déposez le fichier PDF ici'
                            : 'Glissez-déposez un PDF ou cliquez pour sélectionner'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF uniquement, 20 MB max</p>
            </div>

            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{width: `${progress}%`}}
                    />
                </div>
            )}
        </div>
    );
};

/**
 * PdfManager - Composant de gestion du fichier PDF d'une newsletter
 * Dans le même style que MediaManager
 */
const PdfManager = ({
                        content,
                        onPdfAdd,
                        onPdfRemove,
                        onPdfChanged,
                        title = 'Fichier PDF de la newsletter',
                        loading = false,
                    }) => {
    const {notification, showSuccess, showError, hideNotification} = useNotification();
    const [removing, setRemoving] = useState(false);

    const hasPdf = Boolean(content?.pdfFile);

    const handlePdfUploaded = async (uploadedMedia) => {
        try {
            await onPdfAdd(content.id, uploadedMedia.id);
            showSuccess('PDF ajouté', 'Le fichier PDF a été ajouté avec succès');
            if (onPdfChanged) onPdfChanged();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du PDF :', error);
            showError('Erreur d\'ajout', 'Impossible d\'ajouter le fichier PDF. Veuillez réessayer.');
        }
    };

    const handleRemovePdf = async () => {
        try {
            setRemoving(true);
            await onPdfRemove(content.id);
            showSuccess('PDF supprimé', 'Le fichier PDF a été supprimé avec succès');
            if (onPdfChanged) onPdfChanged();
        } catch (error) {
            console.error('Erreur lors de la suppression du PDF :', error);
            showError('Erreur de suppression', 'Impossible de supprimer le fichier PDF. Veuillez réessayer.');
        } finally {
            setRemoving(false);
        }
    };

    return (
        <Panel title={title} loading={loading}>
            <div className="space-y-4">
                {!content?.id && !loading && (
                    <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-4">
                        Vous devez d'abord sauvegarder la newsletter avant d'ajouter un fichier PDF.
                    </div>
                )}

                {/* Affichage du PDF existant */}
                {hasPdf && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <DocumentIcon className="h-8 w-8 text-red-500 flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {content.pdfFile.title || 'Fichier PDF'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {content.pdfFile.fileUrl}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <a
                                href={content.pdfFile.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Télécharger le PDF"
                                className="inline-flex items-center justify-center p-1.5 rounded text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4"/>
                            </a>
                            <IconButton
                                icon={removing ? XMarkIcon : TrashIcon}
                                label="Supprimer le PDF"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemovePdf}
                                disabled={removing || loading}
                                title="Supprimer le PDF"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            />
                        </div>
                    </div>
                )}

                {/* Zone d'upload (affiché uniquement si pas de PDF ou pour remplacer) */}
                {content?.id && !hasPdf && (
                    <PdfPickerWrapper
                        onUploadComplete={handlePdfUploaded}
                        disabled={loading}
                    />
                )}

                {/* Message si PDF déjà présent */}
                {content?.id && hasPdf && !loading && (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        Un fichier PDF est déjà associé à cette newsletter. Supprimez-le pour en ajouter un nouveau.
                    </div>
                )}
            </div>

            {notification.show && (
                <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={hideNotification}
                />
            )}
        </Panel>
    );
};

PdfManager.propTypes = {
    content: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        pdfFile: PropTypes.shape({
            id: PropTypes.string,
            fileUrl: PropTypes.string,
            title: PropTypes.string,
        }),
    }).isRequired,
    onPdfAdd: PropTypes.func.isRequired,
    onPdfRemove: PropTypes.func.isRequired,
    onPdfChanged: PropTypes.func,
    title: PropTypes.string,
    loading: PropTypes.bool,
};

PdfManager.defaultProps = {
    onPdfChanged: null,
    title: 'Fichier PDF de la newsletter',
    loading: false,
};

export default PdfManager;
