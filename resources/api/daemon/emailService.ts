import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.APP_URL;
const APP_NAME = process.env.APP_NAME;
const API_KEY = process.env.APP_KEY;


const getCSRFToken = () => localStorage.getItem(`${APP_NAME}-password-csrfToken`);
export const sendForgotPasswordEmailRequest = async (email: string): Promise<string> => {
    try {
        const response = await axios.post('/api/emails/forgot-password', { email }, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            }
        });

        console.log("Response Headers:", response.headers);

        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
            localStorage.setItem(`${APP_NAME}-password-csrfToken`, csrfToken);
            console.log("CSRF Token stored in localStorage:", csrfToken);
        } else {
            console.log('No CSRF token received in response headers');
        }

        console.log('Password reset email sent successfully.');

        return "If this email exists, a password reset link has been sent.";
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            console.log('Sending email if present...');
            return "If this email exists, a password reset link has been sent.";
        }

        console.error('Error sending password reset email:', error);
        throw new Error('There was n error sending the password reset email.');
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<any> => {
    try {
        const csrfToken = localStorage.getItem(`${APP_NAME}-password-csrfToken`);
        if (!csrfToken) {
            throw new Error('CSRF token is missing');
        }

        console.log('Sending request with CSRF Token:', csrfToken);

        const response = await axios.post(
            '/api/emails/reset-password',
            { token, newPassword },
            {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'X-CSRF-Token': csrfToken,
                    'Content-Type': 'application/json'
                },
            }
        );

        console.log("Response Data:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};
