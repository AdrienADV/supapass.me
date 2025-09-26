import { Navigate, Route, Routes } from 'react-router';

import { SessionProvider, useSession } from './context/SessionContext';
import GuestProtectedRoute from './context/GuestProtectedRoute';
import AuthProtectedRoute from './context/AuthProtectedRoute';

import Login from './pages/auth/login';
import LandingPage from './pages/landing-page';
import PassGenerator from './pages/app/pass-generator';
import WebPass from './pages/web-pass';

function Router() {
  const { session } = useSession();

  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/web-pass/:passId" element={<WebPass />} />

        <Route element={<GuestProtectedRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<AuthProtectedRoute />}>
          <Route path="/pass-generator" element={<PassGenerator />} />
        </Route>

        <Route path="*" element={<Navigate to={session ? "/pass-generator" : "/"} />} />
      </Routes>
    </SessionProvider>
  );
}

export default Router
