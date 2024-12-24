import axios from 'axios';

const APP_NAME = process.env.APP_NAME;
const API_KEY = process.env.APP_KEY;

export const logout = async () => {
    try {

        const csrfToken = localStorage.getItem(`${APP_NAME}-session-csrfToken`);

        if (!csrfToken) {
            console.log("No CSRF token found in localStorage.");
        }

        const csrfTokens: string[] = [];
        const keys = Object.keys(localStorage);

        keys.forEach(key => {
            if (key.includes(`${APP_NAME}-session-csrfToken`)) {
                const token = localStorage.getItem(key);
                if (token) {
                    csrfTokens.push(token);
                }
            }
        });

        console.log("Sending CSRF tokens in logout request:", csrfTokens);

        const response = await axios.post('/api/logout', {
            csrfTokens: csrfTokens
        }, {
            withCredentials: true,
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (response.data.message === 'Logged out successfully') {
            localStorage.removeItem(`${APP_NAME}-session-jwtToken`);
            localStorage.removeItem(`${APP_NAME}-session-csrfToken`);
            localStorage.removeItem(`${APP_NAME}-session-userId`);
            localStorage.removeItem(`${APP_NAME}-session-role`);

            sessionStorage.removeItem(`${APP_NAME}-session-jwtToken`);
            sessionStorage.removeItem(`${APP_NAME}-session-csrfToken`);
            sessionStorage.removeItem(`${APP_NAME}-session-userId`);
            sessionStorage.removeItem(`${APP_NAME}-session-role`);

            document.cookie = 'XSRF-TOKEN=; Max-Age=0';
            document.cookie = 'token=; Max-Age=0';

            document.cookie = `isLoggedOut=true; path=/; max-age=3600`;
            console.log("Application session has been cleared.");
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
};
