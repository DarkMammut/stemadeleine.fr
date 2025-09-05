"use client";

import {useAxiosClient} from "@/utils/axiosClient";

export default function useAddSection() {
    const axios = useAxiosClient();

    const createSection = async (sectionData) => {
        try {
            const response = await axios.post("/api/sections", sectionData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de la section :", error);
            throw error;
        }
    };

    const updateSection = async (sectionId, sectionData) => {
        try {
            const response = await axios.put(`/api/sections/${sectionId}`, sectionData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la section :", error);
            throw error;
        }
    };

    return {createSection, updateSection};
}
