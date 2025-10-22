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

const Protected = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const user = useAuthStore(s => s.user);
  const isInitialized = useAuthStore(s => s.isInitialized);
  
  // Show loading while auth state is being rehydrated
  if (!isInitialized) {
    return <div className="p-8">Loading...</div>;
  }
  
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const isInitialized = useAuthStore(s => s.isInitialized);
  
  // Show loading while auth state is being rehydrated
  if (!isInitialized) {
    return <div className="p-8">Loading...</div>;
  }
  
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/voter/register" element={<VoterRegisterPage />} />
        <Route path="/voter/login" element={<VoterLoginPage />} />
        <Route path="/candidate/register" element={<CandidateRegisterPage />} />
        <Route path="/candidate/login" element={<CandidateLoginPage />} />
        <Route element={<DashboardLayout />}>        
          <Route path="/admin/dashboard" element={<Protected roles={["super_admin","election_admin"]}><AdminPortal /></Protected>} />
          <Route path="/candidate/dashboard" element={<Protected roles={["candidate"]}><CandidateDashboard /></Protected>} />
          <Route path="/voter/dashboard" element={<Protected roles={["voter"]}><VoterDashboard /></Protected>} />
          <Route path="/elections" element={<ElectionsListPage />} />
          <Route path="/elections/create" element={<Protected roles={["super_admin","election_admin"]}><CreateElectionPage /></Protected>} />
          <Route path="/elections/:contractAddress" element={<ElectionDetailsPage />} />
          <Route path="/elections/:contractAddress/register" element={<Protected><ElectionRegistrationPage /></Protected>} />
          <Route path="/elections/:contractAddress/candidates" element={<ElectionCandidatesView />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
