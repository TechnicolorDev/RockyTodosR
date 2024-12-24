import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FaTshirt, FaUser, FaCog, FaUserEdit, FaTasks, FaPalette } from 'react-icons/fa';

const APP_NAME = process.env.APP_NAME;

const AdminPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="admin-page">
            <button
                className="admin-page-sidebar-button"
                onClick={toggleSidebar}
                style={{ display: sidebarOpen ? 'none' : 'block' }}
            >
                &#9776;
            </button>

            <aside className={`admin-page-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-page-header">
                    <h1>{APP_NAME}</h1>
                </div>

                <section className="sidebar-section">
                    <h2>Overview</h2>
                    <nav className="admin-page-nav-menu">
                        <ul>
                            <li><a href="/admin/todos" className={`admin-page-a ${isActive('/admin/todos')}`}><FaTasks /> Todos</a></li>
                            <li><a href="/admin/users" className={`admin-page-a ${isActive('/admin/users')}`}><FaUser /> Users</a></li>
                        </ul>
                    </nav>
                </section>

                <section className="sidebar-section">
                    <h2>Edit</h2>
                    <nav className="admin-page-nav-menu">
                        <ul>
                            <li><a href="/admin/users" className={`admin-page-a ${isActive('/admin/edit/users')}`}><FaUserEdit /> Users</a></li>
                            <li><a href="/admin/todos" className={`admin-page-a ${isActive('/admin/edit/todos')}`}><FaTasks /> Todos</a></li>
                            <li><a href="/admin/assignments" className={`admin-page-a ${isActive('/admin/assignments')}`}><FaTshirt /> Assignments</a></li>
                        </ul>
                    </nav>
                </section>

                <section className="sidebar-section">
                    <h2>Customize</h2>
                    <nav className="admin-page-nav-menu">
                        <ul>
                            <li><a href="/admin/colors" className={`admin-page-a ${isActive('/admin/colors')}`}><FaPalette /> Colors</a></li>
                            <li><a href="/admin/elements" className={`admin-page-a ${isActive('/admin/elements')}`}><FaCog /> Elements</a></li>
                        </ul>
                    </nav>
                </section>
            </aside>

            <main className="admin-page-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPage;
