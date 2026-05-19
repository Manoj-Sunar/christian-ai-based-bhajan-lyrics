import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    timeout: 60000,

});



let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};


const isAuthRoute = (url?: string) => {
    if (!url) return false;
    return ["/auth/login", "/auth/register", "/auth/refresh"].some((route) =>
        url.includes(route)
    );
};


api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // ❌ If no config → reject
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // ✅ 🔥 SKIP interceptor for auth routes (VERY IMPORTANT)
        if (isAuthRoute(originalRequest.url)) {
            return Promise.reject(error);
        }

        // ❌ If not 401 OR already retried → reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // ================= HANDLE REFRESH =================

        // 🔁 If refresh already in progress → queue requests
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        // 🚀 Start refresh
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await api.post("/auth/refresh"); // cookie-based refresh

            processQueue(null);

            return api(originalRequest); // retry original request
        } catch (err) {
            processQueue(err, null);

            // 🚨 logout on refresh failure
            if (typeof window !== "undefined") {
                window.location.href = "/admin-login";
            }

            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);




// Generic error handler
const handleError = (error: unknown) => {
    const err = error as AxiosError;

    console.error("API Error:", err.response?.data || err.message);

    return Promise.reject(err); // ✅ KEEP ORIGINAL ERROR
};





export const apiClient = {
    get: async <T>(url: string, config?: any): Promise<T> => {
        try {
            const res = await api.get<T>(url, config);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    post: async <T, B>(
        url: string,
        body: B,
        config?: any // 👈 add this
    ): Promise<T> => {
        try {
            const res = await api.post<T>(url, body, config);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    patch: async <T, B>(url: string, body: B): Promise<T> => {
        try {
            const res = await api.patch<T>(url, body); // ✅ FIX (you used PUT)
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    delete: async <T>(url: string): Promise<T> => {
        try {
            const res = await api.delete<T>(url);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
};