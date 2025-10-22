import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminRegisterPage } from './pages/admin/AdminRegisterPage';
import { AdminPortal } from './pages/admin/AdminPortal';
import { VoterRegisterPage } from './pages/voter/VoterRegisterPage';
import { VoterLoginPage } from './pages/voter/VoterLoginPage';
import { CandidateRegisterPage } from './pages/candidate/CandidateRegisterPage';
import { CandidateLoginPage } from './pages/candidate/CandidateLoginPage';
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { VoterDashboard } from './pages/voter/VoterDashboard';
import { ElectionCandidatesView } from './pages/candidate/ElectionCandidatesView';
import { ElectionsListPage } from './pages/elections/ElectionsListPage';
import { ElectionDetailsPage } from './pages/elections/ElectionDetailsPage';
import { ElectionRegistrationPage } from './pages/elections/ElectionRegistrationPage';
import { CreateElectionPage } from './pages/elections/CreateElectionPage';
import { useAuthStore } from './stores/authStore';
const Protected = ({ children, roles }) => {
    const user = useAuthStore(s => s.user);
    const isInitialized = useAuthStore(s => s.isInitialized);
    // Show loading while auth state is being rehydrated
    if (!isInitialized) {
        return _jsx("div", { className: "p-8", children: "Loading..." });
    }
    if (!user)
        return _jsx(Navigate, { to: "/", replace: true });
    if (roles && !roles.includes(user.role))
        return _jsx(Navigate, { to: "/", replace: true });
    return children;
};
export default function App() {
    const isInitialized = useAuthStore(s => s.isInitialized);
    // Show loading while auth state is being rehydrated
    if (!isInitialized) {
        return _jsx("div", { className: "p-8", children: "Loading..." });
    }
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "p-8", children: "Loading..." }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/admin/login", element: _jsx(AdminLoginPage, {}) }), _jsx(Route, { path: "/admin/register", element: _jsx(AdminRegisterPage, {}) }), _jsx(Route, { path: "/voter/register", element: _jsx(VoterRegisterPage, {}) }), _jsx(Route, { path: "/voter/login", element: _jsx(VoterLoginPage, {}) }), _jsx(Route, { path: "/candidate/register", element: _jsx(CandidateRegisterPage, {}) }), _jsx(Route, { path: "/candidate/login", element: _jsx(CandidateLoginPage, {}) }), _jsxs(Route, { element: _jsx(DashboardLayout, {}), children: [_jsx(Route, { path: "/admin/dashboard", element: _jsx(Protected, { roles: ["super_admin", "election_admin"], children: _jsx(AdminPortal, {}) }) }), _jsx(Route, { path: "/candidate/dashboard", element: _jsx(Protected, { roles: ["candidate"], children: _jsx(CandidateDashboard, {}) }) }), _jsx(Route, { path: "/voter/dashboard", element: _jsx(Protected, { roles: ["voter"], children: _jsx(VoterDashboard, {}) }) }), _jsx(Route, { path: "/elections", element: _jsx(ElectionsListPage, {}) }), _jsx(Route, { path: "/elections/create", element: _jsx(Protected, { roles: ["super_admin", "election_admin"], children: _jsx(CreateElectionPage, {}) }) }), _jsx(Route, { path: "/elections/:contractAddress", element: _jsx(ElectionDetailsPage, {}) }), _jsx(Route, { path: "/elections/:contractAddress/register", element: _jsx(Protected, { children: _jsx(ElectionRegistrationPage, {}) }) }), _jsx(Route, { path: "/elections/:contractAddress/candidates", element: _jsx(ElectionCandidatesView, {}) })] })] }) }));
}
