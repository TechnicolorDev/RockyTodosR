import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleProtectedRoute from './Protector/RouteProtector';
import { ColorProvider } from './api/Providers/Color/ColorContext';
import { getColors } from './api/getColors';
import { todoRoutes } from './scripts/routes/todoRouter/routes';
import { adminRoutes } from './scripts/routes/AdminRouter/routes';
import { Roles } from './api/Providers/interfaces/interfaces';

interface RouteConfig {
    path: string;
    component: React.ComponentType<any>;
    protected?: boolean;
    requiredRole?: Roles;
    globalToastMessages?: boolean;
    children?: RouteConfig[];
}

const App: React.FC = () => {
    const [colorsLoaded, setColorsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    const preloadColors = async () => {
        try {
            const colorData = await getColors();
            const style = document.createElement('style');
            style.innerHTML = `:root {
                ${Object.entries(colorData)
                .map(([cssVar, colorValue]) => `${cssVar}: ${colorValue};`)
                .join(' ')}
            }`;
            document.head.appendChild(style);
            setColorsLoaded(true);
        } catch (error) {
            console.error('Error preloading colors:', error);
            setColorsLoaded(true);
        }
    };

    useEffect(() => {
        preloadColors();
    }, []);

    useEffect(() => {
        if (colorsLoaded) {
            const loadingTimeout = setTimeout(() => setLoading(false), 500);
            return () => clearTimeout(loadingTimeout);
        }
    }, [colorsLoaded]);

    const renderRoutes = (routes: RouteConfig[]) => {
        return routes.map((route) => {
            const { path, component: Component, protected: isProtected, requiredRole, children } = route;

            if (isProtected) {
                return (
                    <Route
                        key={path}
                        path={path}
                        element={<RoleProtectedRoute element={<Component />} requiredRole={requiredRole!} />}
                    >
                        {children && renderRoutes(children)}
                    </Route>
                );
            }

            return (
                <Route key={path} path={path} element={<Component />}>
                    {children && renderRoutes(children)}
                </Route>
            );
        });
    };

    return (
        <ColorProvider>
            <Router>
                <div className="app">
                    <Routes>
                        {renderRoutes(todoRoutes.main)}
                        {renderRoutes(adminRoutes.main)}
                    </Routes>
                </div>
            </Router>
        </ColorProvider>
    );
};

export default App;
