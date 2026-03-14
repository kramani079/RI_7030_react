import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Shared components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

// Main pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Employees from './pages/Employees';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Salary from './pages/Salary';

/* ── Initial data ───────────────────────────────────── */
const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
})();
const genericEmpName = storedUser?.role === 'Employee' ? storedUser.name : 'Employee User';

const INITIAL_PRODUCTS = [
  { id: 'RI_1001', name: 'Gold Ring', stock: 120, lowStock: false, unitCost: 8000, production: { C: true, F: true, G: true, P: true } },
  { id: 'RI_1002', name: 'Gold Chain', stock: 85, lowStock: false, unitCost: 5000, production: { C: true, F: true, G: true, P: false } },
  { id: 'RI_1003', name: 'Diamond Necklace', stock: 3, lowStock: true, unitCost: 6000, production: { C: true, F: true, G: false, P: false } },
  { id: 'RI_1004', name: 'Gold Bangle', stock: 200, lowStock: false, unitCost: 1400, production: { C: true, F: false, G: false, P: false } },
  { id: 'RI_1005', name: 'Silver Earrings', stock: 4, lowStock: true, unitCost: 500, production: { C: false, F: false, G: false, P: false } },
];

const INITIAL_ORDERS = [
  { id: 'RI_2001', customer: 'Mahesh Patel', email: 'mahesh@gmail.com', product: 'Gold Chain', productId: 'RI_1002', qty: 50, unitPrice: '5000', amount: '₹2,50,000', dueDate: 'Feb 28, 2026', production: { C: true, F: true, G: true, P: false }, status: 'In Production' },
  { id: 'RI_2002', customer: 'Ramesh Jewellers', email: 'ramesh@jewellers.com', product: 'Ring Set', productId: 'RI_1002', qty: 30, unitPrice: '3000', amount: '₹90,000', dueDate: 'Mar 2, 2026', production: { C: true, F: true, G: false, P: false }, status: 'In Production' },
  { id: 'RI_2003', customer: 'Vijay Exports', email: 'vijay@exports.com', product: 'Necklace', productId: 'RI_1003', qty: 20, unitPrice: '6000', amount: '₹1,20,000', dueDate: 'Mar 5, 2026', production: { C: true, F: false, G: false, P: false }, status: 'Pending' },
  { id: 'RI_2004', customer: 'Anita Stores', email: 'anita@stores.com', product: 'Earrings', productId: 'RI_1005', qty: 100, unitPrice: '500', amount: '₹50,000', dueDate: 'Mar 7, 2026', production: { C: true, F: true, G: true, P: true }, status: 'Ready' },
  { id: 'RI_2005', customer: 'Suresh Traders', email: 'suresh@traders.com', product: 'Silver Earrings', productId: 'RI_1005', qty: 200, unitPrice: '200', amount: '₹40,000', dueDate: 'Feb 15, 2026', production: { C: true, F: true, G: true, P: true }, status: 'Delivered' },
];

const INITIAL_HISTORY = [
  { id: 'RI_3001', type: 'Sell', party: 'Mahesh Patel', product: 'Gold Ring', productId: 'RI_1001', qty: '10', amount: '₹80,000', date: 'Feb 24, 2026', status: 'Received' },
  { id: 'RI_3002', type: 'Buy', party: 'Nikhil Supplier', product: 'Raw Gold', productId: 'RI_1001', qty: '5', amount: '₹22,500', date: 'Feb 23, 2026', status: 'Pending' },
  { id: 'RI_3003', type: 'Sell', party: 'Ramesh Jewellers', product: 'Gold Chain', productId: 'RI_1002', qty: '5', amount: '₹35,000', date: 'Feb 22, 2026', status: 'Received' },
  { id: 'RI_3004', type: 'Buy', party: 'Rajan Chemicals', product: 'Plating Chemicals', productId: 'RI_1004', qty: '10', amount: '₹10,000', date: 'Feb 21, 2026', status: 'Pending' },
  { id: 'RI_3005', type: 'Sell', party: 'Suresh Traders', product: 'Gold Bangle', productId: 'RI_1004', qty: '20', amount: '₹28,000', date: 'Feb 20, 2026', status: 'Cancelled' },
  { id: 'RI_3006', type: 'Buy', party: genericEmpName, product: 'Salary - January', productId: 'EMP_SALARY', qty: '1', amount: '₹25,000', date: 'Feb 01, 2026', status: 'Paid' },
  { id: 'RI_3007', type: 'Buy', party: genericEmpName, product: 'Salary - December', productId: 'EMP_SALARY', qty: '1', amount: '₹25,000', date: 'Jan 01, 2026', status: 'Paid' },
  { id: 'RI_3008', type: 'Buy', party: genericEmpName, product: 'Salary - November', productId: 'EMP_SALARY', qty: '1', amount: '₹25,000', date: 'Dec 01, 2025', status: 'Paid' },
  { id: 'RI_3009', type: 'Buy', party: genericEmpName, product: 'Salary - October', productId: 'EMP_SALARY', qty: '1', amount: '₹25,000', date: 'Nov 01, 2025', status: 'Paid' },
  { id: 'RI_3010', type: 'Buy', party: genericEmpName, product: 'Salary - September', productId: 'EMP_SALARY', qty: '1', amount: '₹25,000', date: 'Oct 01, 2025', status: 'Paid' },
];

function App() {
  const { user, login, logout, updateUser } = useAuth();

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [history, setHistory] = useState(INITIAL_HISTORY);

  function handleTransaction(tx) {
    setHistory(prev => [tx, ...prev]);

    const isInventoryItem = tx.productId !== 'EMP_SALARY' && tx.productId !== 'EXPENSE';
    if (isInventoryItem && (tx.productId || tx.product)) {
      setProducts(prev => {
        const existingIdx = prev.findIndex(p =>
          (tx.productId && p.id === tx.productId) ||
          (p.name && p.name.toLowerCase() === tx.product.toLowerCase())
        );

        if (existingIdx > -1) {
          return prev.map((p, idx) => {
            if (idx === existingIdx) {
              const qty = Number(tx.qty) || 0;
              const newStock = tx.type === 'Buy' ? p.stock + qty : p.stock - qty;
              return { ...p, stock: newStock, lowStock: newStock < 15 };
            }
            return p;
          });
        } else if (tx.type === 'Buy') {
          const newId = tx.productId || `RI_${Math.floor(1000 + Math.random() * 9000)}`;
          return [
            ...prev,
            {
              id: newId, name: tx.product,
              stock: Number(tx.qty) || 0,
              lowStock: (Number(tx.qty) || 0) < 15,
              unitCost: 0,
              production: { C: false, F: false, G: false, P: false }
            }
          ];
        }
        return prev;
      });
    }
  }

  // Default redirect path based on role
  function getDefaultPath() {
    if (!user) return '/login';
    return user.role === 'Employee' ? '/employee/dashboard' : '/dashboard';
  }

  return (
    <Routes>
      {/* ── LOGIN & REGISTER ─────────────────────────── */}
      <Route path="/login" element={
        user ? <Navigate to={getDefaultPath()} replace /> : <LoginPage onLogin={login} />
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── ROOT → redirect to login or dashboard ────── */}
      <Route path="/" element={
        user ? <Navigate to={getDefaultPath()} replace /> : <Navigate to="/login" replace />
      } />

      {/* ── ADMIN ROUTES ─────── (role = Admin, protected) ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard orders={orders} history={history} products={products} />} />
      </Route>

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Inventory products={products} setProducts={setProducts} />} />
      </Route>

      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Orders orders={orders} setOrders={setOrders} onTransaction={handleTransaction} products={products} history={history} />} />
      </Route>

      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Employees onTransaction={handleTransaction} history={history} />} />
      </Route>

      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Transactions history={history} setHistory={setHistory} onTransaction={handleTransaction} products={products} />} />
      </Route>

      <Route
        path="/salary"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Salary history={history} setHistory={setHistory} onTransaction={handleTransaction} />} />
      </Route>

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile user={user} onUpdateUser={updateUser} />} />
      </Route>

      {/* ── EMPLOYEE ROUTES ──── (role = Employee, protected) ── */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRole="Employee">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard orders={orders} history={history} products={products} />} />
        <Route path="dashboard" element={<Dashboard orders={orders} history={history} products={products} />} />
        <Route path="orders" element={<Orders orders={orders} setOrders={setOrders} onTransaction={handleTransaction} products={products} history={history} />} />
        <Route path="inventory" element={<Inventory products={products} setProducts={setProducts} />} />
        <Route path="transactions" element={<Transactions history={history} setHistory={setHistory} onTransaction={handleTransaction} products={products} />} />
        <Route path="salary" element={<Salary history={history} setHistory={setHistory} onTransaction={handleTransaction} />} />
        <Route path="profile" element={<Profile user={user} onUpdateUser={updateUser} />} />
      </Route>

      {/* ── CATCH-ALL → login or dashboard ─────────── */}
      <Route path="*" element={<Navigate to={getDefaultPath()} replace />} />
    </Routes>
  );
}

export default App;
