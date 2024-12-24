import axios, {AxiosError, AxiosResponse} from 'axios';
import {LoginResponse, Todo} from "./Providers/interfaces/interfaces";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.APP_URL;
const APP_NAME = process.env.APP_NAME;
const API_BASE = "api";
const API_KEY = process.env.APP_KEY;


const getCSRFToken = () => localStorage.getItem(`${APP_NAME}-session-csrfToken`);

export const setCSRFTokenInHeaders = () => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        axios.defaults.headers['X-CSRF-Token'] = csrfToken;
    }
};



interface InstallAdminData {
    name: string;
    email: string;
    password: string;
}
export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    try {
        if (credentials?.email && credentials?.password) {
            console.log("Login request data:", credentials);

            const response = await axios.post<LoginResponse>('/api/login', credentials, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            console.log('Response Headers:', response.headers);

            if (response.status === 200) {
                const csrfToken = response.headers['x-csrf-token'] || response.headers['X-CSRF-Token'];
                console.log('Extracted CSRF Token:', csrfToken);

                if (!csrfToken) {
                    throw new Error('CSRF token missing in response');
                }

                const storageKey = `${APP_NAME}-session-csrfToken`;
                console.log('Attempting to save CSRF token in localStorage...');

                try {
                    localStorage.setItem(storageKey, csrfToken);
                    const storedToken = localStorage.getItem(storageKey);
                    if (storedToken === csrfToken) {
                        console.log(`CSRF token successfully saved. Key: "${storageKey}", Value: "${storedToken}"`);
                    } else {
                        console.error(`Failed to verify saved CSRF token. Key: "${storageKey}", Retrieved Value: "${storedToken}"`);
                    }
                } catch (storageError) {
                    console.error(`Error while saving CSRF token to localStorage. Key: "${storageKey}", Error:`, storageError);
                }

                setCSRFTokenInHeaders();

                console.log('Login successful:', response.data);

                const { username, email, gravatarUrl } = response.data;
                localStorage.setItem("user", JSON.stringify({ username, email, gravatarUrl }));

                return response.data;
            }

            if (response.status === 401) {
                console.log('Login failed: Unauthorized access');
                return { message: 'Login failed: Invalid credentials' } as LoginResponse;
            }
        }

        throw new Error('Invalid credentials');
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.log('Login failed: Unauthorized access');
                return { message: 'Login failed: Invalid credentials' } as LoginResponse;
            }
        }
        console.error('Error during login:', error);
        throw new Error('Login failed');
    }
};
