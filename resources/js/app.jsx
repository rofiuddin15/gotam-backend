import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import PartnerVerification from './pages/PartnerVerification';
import MitraManagement from './pages/MitraManagement';
import ServiceContent from './pages/ServiceContent';
import FinancialReports from './pages/FinancialReports';
import RoleManagement from './pages/RoleManagement';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    {/* Login Route */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Redirect root to /admin */}
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                    
                    {/* Protected Admin Routes */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="mitra" element={<MitraManagement />} />
                        <Route path="partners" element={<PartnerVerification />} />
                        <Route path="services" element={<ServiceContent />} />
                        <Route path="reports" element={<FinancialReports />} />
                        <Route path="settings" element={<RoleManagement />} />
                        <Route path="support" element={<AuditLogs />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

if (document.getElementById('app')) {
    const root = ReactDOM.createRoot(document.getElementById('app'));
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
