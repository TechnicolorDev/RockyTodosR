import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/api";
import { LoginResponse } from "../../api/Providers/interfaces/interfaces";
import DOMPurify from "dompurify";
import "../../scss/App.scss";
import LoadedAnimation from "../../Loader/Animations/LoadedAnimation";
import JumpIn from "../../Loader/Animations/JumpIn";
import LoadFromSideR from "../../Loader/Animations/LoadFromSideR";
import { toast } from "react-toastify";
import { MdEmail, MdLock } from "react-icons/md";

const APP_NAME = process.env.APP_NAME;

interface LoginForm {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = (form: LoginForm): boolean => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(form.email)) {
            toast.error("Invalid email format.");
            return false;
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return false;
        }

        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value.trim() });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!validateForm(form)) {
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting to log in with inputs:", form.email);

            const response = await login(form);

            console.log("Login response:", response);

            const sanitizedMessage = DOMPurify.sanitize(response?.message || "");

            if (response.message === "Login successful") {
                const toastId = "login-success-toast";

                setTimeout(() => {
                    navigate("/");
                    toast.success("Logged in successfully!", {});
                }, 100);
            } else {
                toast.error(sanitizedMessage || "Invalid credentials.");
            }
        } catch (error: any) {
            console.error("Error logging in:", error);
            toast.error("Login failed. Ensure CSRF token is received.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <LoadedAnimation>
                <div className="login">
                    <form onSubmit={handleSubmit}>
                        <JumpIn delay={200}>
                            <h1 className="text-login">Login</h1>
                        </JumpIn>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="login-input"
                            />
                            <MdEmail className="input-icon" />
                        </div>

                        <LoadFromSideR delay={550}>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="login-input"
                                />
                                <MdLock className="input-icon" />
                            </div>
                        </LoadFromSideR>
                        <JumpIn delay={700}>
                            <button type="submit" className="loginb-btn" disabled={loading}>
                                Log In
                            </button>
                        </JumpIn>
                        <JumpIn delay={900}>
                            <a className="forgot-password-text" href="/forgot-password">
                                Forgot password?
                            </a>
                        </JumpIn>
                    </form>
                </div>
            </LoadedAnimation>
        </div>
    );
};

export default Login;
