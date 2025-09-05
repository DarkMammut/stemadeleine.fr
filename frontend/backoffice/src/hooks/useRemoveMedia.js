import {useAxiosClient} from "@/utils/axiosClient";
import {useState} from "react";

export default function useRemoveMedia() {
    const axios = useAxiosClient();
    const [loading, setLoading] = useState(false);

    const removeMedia = async (entityType, entityId) => {
        setLoading(true);
        try {
            const response = await axios.delete(`/api/${entityType}/${entityId}/hero-media`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression du média de ${entityType}:`, error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {removeMedia, loading};
}
