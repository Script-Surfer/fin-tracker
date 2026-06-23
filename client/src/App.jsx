import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage     from './pages/BudgetsPage';
import UploadPage      from './pages/UploadPage';
import SettingsPage    from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/budgets"      element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
            <Route path="/upload"       element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;