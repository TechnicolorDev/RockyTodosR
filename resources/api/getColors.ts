import axios from "axios";

import {Color} from "../api/Providers/interfaces/interfaces";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.APP_URL;
const APP_NAME = process.env.APP_NAME;
const API_BASE = "api";
const API_KEY = process.env.APP_KEY;
const getCSRFToken = () => localStorage.getItem(`${APP_NAME}-session-csrfToken`);

const csrfToken = getCSRFToken();
export const getColors = async (): Promise<Color> => {
    try {
        const response = await axios.get('/api/admin/colors', {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-CSRF-Token': csrfToken
            }
        });
        console.log('Response from getColors:', response);
        return response.data as Color;
    } catch (error) {
        console.error('Error fetching colors:', error);
        throw error;
    }
};

export const updateColor = async (name: string, value: string): Promise<{ message: string }> => {
    try {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            throw new Error('CSRF token is missing');
        }
        const response = await axios.post('/api/admin/colors', { name, value }, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-CSRF-Token': csrfToken
            }
        });
        console.log('Response from updateColor:', response);
        return response.data;
    } catch (error) {
        console.error('Error updating color:', error);
        throw error;
    }
};

export const resetColors = async (): Promise<{ message: string }> => {
    try {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            throw new Error('CSRF token is missing');
        }
        const response = await axios.post(`/api/admin/colors/reset`, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-CSRF-Token': csrfToken
            }
        });
        console.log('Response from resetColors:', response);
        return response.data;
    } catch (error) {
        console.error('Error resetting colors:', error);
        throw error;
    }
};
