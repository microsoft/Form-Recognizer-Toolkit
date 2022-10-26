import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import { delay } from "utils";

// Constants from FOTT.
const INITIAL_RETRY_INTERVAL = 500;
const MAX_RETRY = 3;

export const getWithAutoRetry = <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T> =>
    sendRequestWithAutoRetry(() => axios.get(url, config));

export const postWithAutoRetry = <T>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T> =>
    sendRequestWithAutoRetry(() => axios.post(url, data, config));

export const putWithAutoRetry = <T>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T> =>
    sendRequestWithAutoRetry(() => axios.put(url, data, config));

export const deleteWithAutoRetry = <T>(url: string, config?: AxiosRequestConfig): AxiosPromise<T> =>
    sendRequestWithAutoRetry(() => axios.delete(url, config));

const sendRequestWithAutoRetry = async <T>(request: () => AxiosPromise<T>) => {
    for (let currentRetry = 0; ; currentRetry++) {
        try {
            return await request();
        } catch (err) {
            if (currentRetry > MAX_RETRY || !isTransient(err)) {
                throw err;
            }

            // Delay between each retry.
            await delay(INITIAL_RETRY_INTERVAL * Math.pow(2, currentRetry - 1));
        }
    }
};

const isTransient = (err) => {
    if (err && err.response) {
        const response = err.response;
        if (response.status === 429 && response.data && response.data.error && response.data.error.code === "1014") {
            return false;
        }
        return [408, 429, 444, 503, 504].includes(response.status);
    }
    return false;
};
