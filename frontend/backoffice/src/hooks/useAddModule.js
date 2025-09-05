"use client";

import {useCallback} from 'react';
import {useAxiosClient} from '@/utils/axiosClient';

export function useAddModule() {
    const axiosClient = useAxiosClient();

    const addModule = useCallback(async ({sectionId, type, name}) => {
        try {
            // Utiliser la route générique /api/modules
            const payload = {
                sectionId,
                name,
                type: type.toUpperCase() // Le backend attend le type en majuscules
            };

            const response = await axiosClient.post('/api/modules', payload);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du module:', error);
            throw error;
        }
    }, [axiosClient]);

    return {addModule};
}
