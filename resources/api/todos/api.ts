import axios from "axios";
import {Todo} from "../Providers/interfaces/interfaces";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.APP_URL;
const APP_NAME = process.env.APP_NAME;
const API_BASE = "api";
const API_KEY = process.env.APP_KEY;


const getCSRFToken = () => localStorage.getItem(`${APP_NAME}-session-csrfToken`);

export const fetchTodos = async (): Promise<any[]> => {
    try {
        const response = await axios.get('/api/todos', {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error("Response is not an array:", response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching todos:', error);
        return [];
    }
};

export const createTodo = async (data: Todo): Promise<Todo> => {
    try {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            throw new Error('CSRF token is missing');
        }
        const response = await axios.post(`${API_BASE}/todos`, data, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${process.env.APP_KEY}`,
                'X-CSRF-Token': csrfToken
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating todo:', error);
        throw error;
    }
};
export const editTodo = async (todoId: string, data: Todo): Promise<void> => {
    try {


        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            throw new Error('CSRF token is missing');
        }

        const response = await axios.patch(
            `${API_BASE}/todos/${todoId}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );

        console.log('Response:', response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('AxiosError:', error);
            console.error('Error response:', error.response);
            console.error('Error request:', error.request);
            console.error('Error message:', error.message);
            console.error('Error config:', error.config);
        } else {
            console.error('Unknown error:', error);
        }
    }
};
export const deleteTodo = async (todoId: string): Promise<{ message: string }> => {
    try {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            throw new Error('CSRF token is missing');
        }
        const response = await axios.delete(`${API_BASE}/todos/${todoId}`, {
            withCredentials: true,  // Include cookies (JWT or other auth tokens)
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-CSRF-Token': csrfToken
            }
        });
        console.log('Response from delete:', response);
        return response.data;
    } catch (error) {
        console.error('Error deleting todo:', error);
        throw error;
    }
};