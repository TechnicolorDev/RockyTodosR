import axios, {Axios, AxiosError} from "axios";
import {LoginResponse} from "../api/Providers/interfaces/interfaces";
import {axiosInterceptors} from "../api/login/interceptors";

const app_key = process.env.APP_KEY;

axiosInterceptors();
export const getUserData = async (): Promise<LoginResponse | null> => {
    try {
        const response = await axios.get<LoginResponse>('/api/login', {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${app_key}`
            },
        });
        if (response.data.isLoggedOutOrNeverLoggedIn) {
            console.log("User is not logged in");
            return null;
        }
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("Error response:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        } else {
            console.error("Unexpected error:", error);
        }

        return null;
    }
};