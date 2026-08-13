import {useCallback, useState} from 'react';
import {NewsPublication} from '@/types/news';
import {PaginatedResponse, PaginationState} from '@/types/pagination';
import {useAxiosClient} from '@/utils/axiosClient';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT = 'publishedDate,desc';

interface FetchNewsPublicationsOptions {
    page?: number;
    size?: number;
    sort?: string;
}

const initialPaginationState: PaginationState = {
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
};

export default function useGetNewsPublications() {
    const [publications, setPublications] = useState<NewsPublication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationState>(initialPaginationState);
    const axiosClient = useAxiosClient();

    const fetchPublications = useCallback(async (options: FetchNewsPublicationsOptions = {}) => {
        const requestedPage = Math.max(options.page ?? pagination.currentPage, 1);
        const requestedSize = Math.max(options.size ?? pagination.pageSize, 1);

        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.get<PaginatedResponse<NewsPublication>>(
                '/api/news-publications/public',
                {
                    params: {
                        page: requestedPage - 1,
                        size: requestedSize,
                        sort: options.sort ?? DEFAULT_SORT,
                    },
                },
            );

            const data = response.data;
            const items = data.content ?? [];
            const currentPage = ((data.number ?? (requestedPage - 1)) + 1);

            setPublications(items);
            setPagination({
                currentPage,
                pageSize: data.size ?? requestedSize,
                totalPages: data.totalPages ?? 0,
                totalItems: data.totalElements ?? items.length,
                hasNextPage: !data.last,
                hasPreviousPage: !data.first,
            });

            return data;
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            const errorMessage = error?.response?.status === 404
                ? 'Aucune actualité trouvée'
                : error?.message || 'Une erreur est survenue';

            setError(errorMessage);
            console.error('Erreur lors de la récupération des actualités:', err);
            setPublications([]);
            setPagination((previous) => ({
                ...previous,
                currentPage: requestedPage,
                pageSize: requestedSize,
                totalPages: 0,
                totalItems: 0,
                hasNextPage: false,
                hasPreviousPage: requestedPage > 1,
            }));
            return null;
        } finally {
            setLoading(false);
        }
    }, [axiosClient, pagination.currentPage, pagination.pageSize]);

    const goToPage = useCallback((page: number) => {
        setPagination((previous) => ({
            ...previous,
            currentPage: Math.max(1, previous.totalPages > 0 ? Math.min(page, previous.totalPages) : page),
        }));
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        setPagination((previous) => ({
            ...previous,
            currentPage: 1,
            pageSize: Math.max(1, pageSize),
        }));
    }, []);

    const clearPublications = useCallback(() => {
        setPublications([]);
        setError(null);
        setPagination(initialPaginationState);
    }, []);

    return {
        publications,
        loading,
        error,
        pagination,
        fetchPublications,
        goToPage,
        setPageSize,
        clearPublications,
    };
}
