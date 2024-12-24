import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from './getUser';
import { GoStack } from "react-icons/go";
import LogoutButton from "../Components/TodosPage/buttons/LogoutButton";

const Navbar: React.FC = () => {
    const [user, setUser] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserData();
            if (userData) {
                setUser(userData);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleAdminRedirect = () => {
        navigate('/admin');
    };

    return (
        <nav className="main-navbar">
            <div className="left-buttons">
                <LogoutButton/>
                <button className="admin-button" onClick={handleAdminRedirect}>
                    <span className="admin-icon"><GoStack></GoStack></span>
                </button>
            </div>
            {user ? (
                <div className="user-info-container">
                    <span className="user-info">
                        <span className="username">{user.username}</span>
                        <span className="email">{user.email}</span>
                    </span>
                    <img
                        className="gravatar"
                        src={user.gravatarUrl}
                        alt="User's Gravatar"
                    />
                </div>
            ) : (
                <span className="not-logged-in">Not logged in</span>
            )}
        </nav>
    );
};

export default Navbar;
