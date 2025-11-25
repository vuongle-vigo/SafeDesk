import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Apps from './pages/Apps';
import Processes from './pages/Processes';
import Activity from './pages/Activity';
import Screenshots from './pages/Screenshots';
import History from './pages/History';
import Limits from './pages/Limits';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { mockUser, mockDevices } from './data/mockData';
import { mockAPI } from './utils/api';

function App() {
  // initialize from localStorage token so reload preserves auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('token'));
    } catch {
      return false;
    }
  });
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('devices');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(null);
  const [devices, setDevices] = useState(mockDevices);
  const [user, setUser] = useState<any>(mockUser);

  const normalizeUser = (u: any) => {
    if (!u) return mockUser;
    return {
      ...mockUser,
      ...u,
      name: u.email ?? u.name ?? mockUser.name, // show email instead of name when available
      email: u.email ?? mockUser.email,
      role: u.role ?? mockUser.role,
      id: u.id ?? u.user_id ?? mockUser.id
    };
  };

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const handleLogin = async (email: string, password: string) => {
    const res = await mockAPI.login(email, password);
    if (res.success) {
      if (res.token) localStorage.setItem('token', res.token);
      if (res.user) setUser(normalizeUser(res.user));
      setIsAuthenticated(true);
    } else {
      alert(res.error || 'Login failed');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const res = await mockAPI.signUp(email, password, name);
    if (res.success) {
      if (res.token) localStorage.setItem('token', res.token);
      if (res.user) setUser(normalizeUser(res.user));
      setIsAuthenticated(true);
    } else {
      alert(res.error || 'Register failed');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      const token = localStorage.getItem('token') || null;
      localStorage.removeItem('token');
      // best-effort notify backend
      mockAPI.logout(token).catch(() => null);
      setIsAuthenticated(false);
      setCurrentPage('devices');
      setSelectedDeviceId(null);
      setSelectedDeviceName(null);
      setUser(mockUser);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || null;
    if (!token) {
      // ensure app state stays logged out if no token
      setIsAuthenticated(false);
      setUser(mockUser);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await mockAPI.getMe(token);
        if (!mounted) return;
        if (res.success && res.user) {
          setUser(normalizeUser(res.user));
          setIsAuthenticated(true);
        } else {
          // token invalid or expired -> clear and reset state
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(mockUser);
        }
      } catch (err) {
        console.warn('getMe failed', err);
        if (mounted) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(mockUser);
        }
      }
    })();
    return () => { mounted = false; };
  }, [/* run on mount; dependency intentionally empty */]);

  const handleSelectDevice = (deviceId: string, deviceName?: string) => {
    setSelectedDeviceId(deviceId);
    setSelectedDeviceName(deviceName ?? null);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === 'devices') {
      setSelectedDeviceId(null);
      setSelectedDeviceName(null);
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId(null);
      setSelectedDeviceName(null);
      setCurrentPage('devices');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'devices':
        return <Devices devices={devices} selectedDeviceId={selectedDeviceId} onSelectDevice={handleSelectDevice} onRemoveDevice={handleRemoveDevice} />;
      case 'dashboard':
        return <Dashboard selectedDeviceId={selectedDeviceId} />;
      case 'apps':
        return <Apps selectedDeviceId={selectedDeviceId} />;
      // case 'processes':
      //   return <Processes />;
      case 'activity':
        return <Activity selectedDeviceId={selectedDeviceId} />;
      case 'screenshots':
        return <Screenshots selectedDeviceId={selectedDeviceId}/>;
      case 'history':
        return <History />;
      case 'limits':
        return <Limits selectedDeviceId={selectedDeviceId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Devices devices={devices} selectedDeviceId={selectedDeviceId} onSelectDevice={handleSelectDevice} onRemoveDevice={handleRemoveDevice} />;
    }
  };

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        selectedDeviceId={selectedDeviceId}
        selectedDeviceName={selectedDeviceName}
      />
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <main className="lg:ml-64 mt-16 p-4 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
