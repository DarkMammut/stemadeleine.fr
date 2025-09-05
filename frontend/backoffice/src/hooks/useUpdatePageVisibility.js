"use client";

import {useAxiosClient} from "@/utils/axiosClient";

export default function useUpdatePageVisibility() {
    const axios = useAxiosClient();

    const updatePageVisibility = async (pageId, isVisible) => {
        try {
            const response = await axios.put(`/api/pages/${pageId}/visibility`, isVisible, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la visibilité :", error);
            throw error;
        }
    };

    return {updatePageVisibility};
}
