import {useCallback} from "react";
import {useAxiosClient} from "@/utils/axiosClient";

// In-memory cache shared across hook instances to avoid repeated network calls
let rolesCache = null;
let rolesPromise = null;

export const useAccountOperations = () => {
    const axios = useAxiosClient();

    const getAccounts = useCallback(
        async (page = 0, size = 10, options = {}) => {
            try {
                // build params map similar to other hooks (payments/users)
                const params = {};
                if (typeof page === "number") params.page = page;
                if (typeof size === "number") params.size = size;
                if (options.search) params.search = options.search;
                if (options.sortField) params.sortField = options.sortField;
                if (options.sortDir) params.sortDir = options.sortDir;
                // allow arbitrary filters like role, provider or multi-values (arrays)
                if (options.role) params.role = options.role;
                if (options.provider) params.provider = options.provider;
                if (options.statuses && Array.isArray(options.statuses)) {
                    options.statuses.forEach((s) => {
                        // axios will serialize duplicate keys when using params with array
                        if (!params.status) params.status = [];
                        params.status.push(s);
                    });
                }

                const config = {params};
                if (options.signal) config.signal = options.signal;

                // NOTE: use admin endpoint for paged/filtered list (requires admin)
                const res = await axios.get(`/api/admin/accounts`, config);
                return res.data;
            } catch (err) {
                // Don't log cancellation errors (they are expected when aborting requests)
                if (
                    err &&
                    (err.code === "ERR_CANCELED" ||
                        err.name === "CanceledError" ||
                        err.message === "canceled")
                ) {
                    // return null on cancellation to avoid throwing and noisy console errors
                    return null;
                }
                console.error("Error fetching accounts (paged):", err);
                throw err;
            }
        },
        [axios],
    );

    const getAccountsByUserId = useCallback(
        async (userId) => {
            try {
                const res = await axios.get(`/api/admin/accounts`, {
                    params: {userId},
                });
                return res.data;
            } catch (err) {
                console.error("Error fetching accounts for user:", err);
                throw err;
            }
        },
        [axios],
    );

    const getAllAccounts = useCallback(async () => {
        try {
            const res = await axios.get(`/api/admin/accounts`);
            return res.data;
        } catch (err) {
            console.error("Error fetching all accounts:", err);
            throw err;
        }
    }, [axios]);

    const getAccountById = useCallback(
        async (id) => {
            try {
                const res = await axios.get(`/api/accounts/${id}`);
                return res.data;
            } catch (err) {
                console.error(`Error fetching account ${id}:`, err);
                throw err;
            }
        },
        [axios],
    );

    const createAccount = useCallback(
        async (data) => {
            try {
                const res = await axios.post(`/api/admin/accounts`, data);
                return res.data;
            } catch (err) {
                console.error("Error creating account:", err);
                throw err;
            }
        },
        [axios],
    );

    const updateAccount = useCallback(
        async (id, data) => {
            try {
                const res = await axios.put(`/api/admin/accounts/${id}`, data);
                return res.data;
            } catch (err) {
                console.error(`Error updating account ${id}:`, err);
                throw err;
            }
        },
        [axios],
    );

    const deleteAccount = useCallback(
        async (id) => {
            try {
                const res = await axios.delete(`/api/admin/accounts/${id}`);
                return res.data;
            } catch (err) {
                console.error(`Error deleting account ${id}:`, err);
                throw err;
            }
        },
        [axios],
    );

    const changePassword = useCallback(
        async (id, {currentPassword, newPassword}) => {
            try {
                const payload = {currentPassword, newPassword};
                const res = await axios.put(`/api/accounts/${id}/password`, payload);
                return res.data;
            } catch (err) {
                console.error(`Error changing password for account ${id}:`, err);
                throw err;
            }
        },
        [axios],
    );

    const attachUser = useCallback(
        async (accountId, userId) => {
            try {
                const res = await axios.put(`/api/admin/accounts/${accountId}/user`, {
                    userId,
                });
                return res.data;
            } catch (err) {
                console.error(
                    `Error attaching user ${userId} to account ${accountId}:`,
                    err,
                );
                throw err;
            }
        },
        [axios],
    );

    const detachUser = useCallback(
        async (accountId) => {
            try {
                const res = await axios.put(`/api/admin/accounts/${accountId}/user`, {
                    userId: null,
                });
                return res.data;
            } catch (err) {
                console.error(`Error detaching user from account ${accountId}:`, err);
                throw err;
            }
        },
        [axios],
    );

    const setActive = useCallback(
        async (accountId, isActive) => {
            try {
                const res = await axios.put(`/api/admin/accounts/${accountId}/active`, {
                    isActive,
                });
                return res.data;
            } catch (err) {
                console.error(
                    `Error setting active=${isActive} for account ${accountId}:`,
                    err,
                );
                throw err;
            }
        },
        [axios],
    );

    // New: fetch available roles from backend. Try admin endpoint then public endpoint, fallback to static list.
    const getRoles = useCallback(async () => {
        // return cached value if available
        if (rolesCache) return rolesCache;
        // if a fetch is already in-flight, reuse its promise
        if (rolesPromise) return rolesPromise;

        rolesPromise = (async () => {
            try {
                // try admin accounts roles endpoint first (we added it to AccountAdminController)
                try {
                    const res = await axios.get(`/api/admin/accounts/roles`);
                    const body = res?.data;
                    if (Array.isArray(body)) {
                        rolesCache = body.map((r) =>
                            typeof r === "string" ? r : r?.name || String(r),
                        );
                        return rolesCache;
                    }
                    rolesCache = [];
                    return rolesCache;
                } catch (e1) {
                    const status1 = e1?.response?.status;
                    if (status1 && status1 !== 404) {
                        console.info(
                            "Error fetching /api/admin/accounts/roles, falling back:",
                            e1?.message || e1,
                        );
                        throw e1; // will be caught by outer catch and fallback
                    }
                    // try secondary admin endpoint
                    try {
                        const res2 = await axios.get(`/api/admin/roles`);
                        const body2 = res2?.data;
                        if (Array.isArray(body2)) {
                            rolesCache = body2.map((r) =>
                                typeof r === "string" ? r : r?.name || String(r),
                            );
                            return rolesCache;
                        }
                        rolesCache = [];
                        return rolesCache;
                    } catch (e2) {
                        const status2 = e2?.response?.status;
                        if (status2 && status2 !== 404) {
                            console.info(
                                "Error fetching /api/admin/roles, falling back:",
                                e2?.message || e2,
                            );
                            throw e2;
                        }
                        // both admin endpoints missing -> fallback to static list
                        rolesCache = ["ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"];
                        return rolesCache;
                    }
                }
            } catch (err) {
                // final fallback
                rolesCache = ["ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"];
                return rolesCache;
            } finally {
                // clear in-flight promise
                rolesPromise = null;
            }
        })();

        return rolesPromise;
    }, [axios]);

    const clearRolesCache = useCallback(() => {
        rolesCache = null;
        rolesPromise = null;
    }, []);

    const resetPasswordByAdmin = useCallback(
        async (accountId, newPassword) => {
            try {
                const payload = {newPassword};
                const res = await axios.post(
                    `/api/admin/accounts/${accountId}/password`,
                    payload,
                );
                return res.data;
            } catch (err) {
                console.error(
                    `Error resetting password for account ${accountId}:`,
                    err,
                );
                throw err;
            }
        },
        [axios],
    );

    return {
        // new paged API
        getAccounts,
        // legacy / existing API
        getAccountsByUserId,
        getAllAccounts,
        getAccountById,
        createAccount,
        updateAccount,
        deleteAccount,
        changePassword,
        attachUser,
        detachUser,
        setActive,
        // newly exposed
        getRoles,
        clearRolesCache,
        resetPasswordByAdmin,
    };
};
