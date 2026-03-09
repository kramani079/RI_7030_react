import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Employees from './pages/Employees';
import Transactions from './pages/Transactions';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  function handleLogin(u) {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="employees" element={<Employees />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
