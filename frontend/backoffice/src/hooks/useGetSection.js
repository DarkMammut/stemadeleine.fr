"use client";

import {useCallback, useEffect, useState} from "react";
import {useAxiosClient} from "@/utils/axiosClient";

export default function useGetSection({sectionId}) {
    const axios = useAxiosClient();
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSection = useCallback(async () => {
        if (!sectionId) return;

        try {
            setLoading(true);
            const response = await axios.get(`/api/sections/${sectionId}`);
            setSection(response.data);
            setError(null);
        } catch (err) {
            console.error("Erreur lors de la récupération de la section :", err);
            setError(err);
            setSection(null);
        } finally {
            setLoading(false);
        }
    }, [sectionId, axios]);

    useEffect(() => {
        fetchSection();
    }, [fetchSection]);

    const refetch = () => {
        fetchSection();
    };

    return {section, refetch, loading, error};
}
