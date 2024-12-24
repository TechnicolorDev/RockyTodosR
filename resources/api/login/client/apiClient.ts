import axios, { AxiosError } from 'axios';

axios.defaults.baseURL = process.env.APP_URL;

const apiClient = axios.create({
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const originalConsoleError = console.error;
            console.error = () => {};

            const resolvedResponse = {
                data: { message: 'Unauthorized. Please log in again.' },
                status: 401,
                statusText: 'Unauthorized',
                headers: error.response.headers,
                config: error.config,
            };

            console.error = originalConsoleError;

            return Promise.resolve(resolvedResponse);
        }

        if (error.response?.status === 404) {
            console.error('API endpoint not found:', error.response.config.url);
            return Promise.reject({
                message: `The requested resource was not found: ${error.response.config.url}`,
                status: 404,
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;
