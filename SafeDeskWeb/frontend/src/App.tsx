import { useState } from 'react';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('devices');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState(mockDevices);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const handleLogin = (email: string, password: string) => {
    setIsAuthenticated(true);
  };

  const handleRegister = (name: string, email: string, password: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      setIsAuthenticated(false);
      setCurrentPage('devices');
      setSelectedDeviceId(null);
    }
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === 'devices') {
      setSelectedDeviceId(null);
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId(null);
      setCurrentPage('devices');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'devices':
        return <Devices devices={devices} selectedDeviceId={selectedDeviceId} onSelectDevice={handleSelectDevice} onRemoveDevice={handleRemoveDevice} />;
      case 'dashboard':
        return <Dashboard />;
      case 'apps':
        return <Apps selectedDeviceId={selectedDeviceId} />;
      case 'processes':
        return <Processes />;
      case 'activity':
        return <Activity />;
      case 'screenshots':
        return <Screenshots />;
      case 'history':
        return <History />;
      case 'limits':
        return <Limits />;
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
        selectedDeviceName={selectedDevice?.name}
      />
      <Header
        user={mockUser}
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
