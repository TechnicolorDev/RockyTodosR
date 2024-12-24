import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { sendForgotPasswordEmailRequest } from "../../../../api/daemon/emailService";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const processEmail = (input: string): { sanitized: string; isValid: boolean } => {
        const sanitized = DOMPurify.sanitize(input.trim());
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized);
        return { sanitized, isValid };
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        const { sanitized, isValid } = processEmail(email);

        if (!isValid) {
            setError('Please enter a valid email address.');
            toast.error('Invalid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await sendForgotPasswordEmailRequest(sanitized);
            toast.success('If this email exists, a password reset link has been sent.');
            setMessage('Check your inbox for further instructions.');
        } catch (err) {
            console.error('Error sending email:', err);
            toast.error('Failed to send the reset email. Please try again later.');
            setError('There was an issue processing your request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    return (
        <div className="forgot-password-div">
            <h2 className="forgot-password-h1">Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="forgot-password-email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleInputChange}
                        required
                        className="forgot-password-email-input"
                        placeholder="Enter your email"
                        aria-describedby="emailHelp"
                    />
                </div>
                <button
                    type="submit"
                    className="forgot-password-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send Password Reset Email'}
                </button>
            </form>

            {message && (
                <p style={{ color: 'green' }} aria-live="polite">{DOMPurify.sanitize(message)}</p>
            )}
            {error && (
                <p style={{ color: 'red' }} aria-live="assertive">{DOMPurify.sanitize(error)}</p>
            )}
        </div>
    );
};

export default ForgotPassword;
