import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
  apiGetProducts, apiGetOrders, apiGetTransactions,
  apiCreateTransaction, apiUpdateProduct, apiCreateProduct,
  apiUpdateTransaction, apiCreateOrder, apiUpdateOrder, apiDeleteOrder,
  apiDeleteProduct, apiDeleteTransaction,
  showToast
} from './api';
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

function App() {
  const { user, login, logout, updateUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const initialFetchDone = useRef(false);

  // Fetch data from MongoDB on mount
  useEffect(() => {
    if (initialFetchDone.current) return;
    
    async function fetchData() {
      if (initialFetchDone.current) return;
      initialFetchDone.current = true;
      
      try {
        const [prods, ords, txns] = await Promise.all([
          apiGetProducts(),
          apiGetOrders(),
          apiGetTransactions(),
        ]);
        setProducts(prods);
        setOrders(ords);
        setHistory(txns);
        setDbConnected(true);
      } catch (err) {
        console.error('Failed to fetch data from server:', err.message);
        setDbConnected(false);
        showToast('Could not connect to database. Some features may not work.', 'warning');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── CRUD helpers that sync with MongoDB ──────────────

  async function handleTransaction(tx) {
    // Save to MongoDB
    try {
      const saved = await apiCreateTransaction(tx);
      setHistory(prev => [saved, ...prev]);
      showToast('Transaction saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save transaction:', err.message);
      // Fallback: add locally
      setHistory(prev => [tx, ...prev]);
    }

    // Update inventory
    const isInventoryItem = tx.productId !== 'EMP_SALARY' && tx.productId !== 'EXPENSE' && tx.productId !== 'EMP_ADVANCE';
    if (isInventoryItem && (tx.productId || tx.product)) {
      setProducts(prev => {
        const existingIdx = prev.findIndex(p =>
          (tx.productId && p.id === tx.productId) ||
          (p.name && p.name.toLowerCase() === tx.product.toLowerCase())
        );

        if (existingIdx > -1) {
          const updated = prev.map((p, idx) => {
            if (idx === existingIdx) {
              const qty = Number(tx.qty) || 0;
              const newStock = tx.type === 'Buy' ? p.stock + qty : p.stock - qty;
              const updatedProduct = { ...p, stock: newStock, lowStock: newStock < 15 };
              // Sync to MongoDB
              apiUpdateProduct(p.id, updatedProduct).catch(() => {});
              return updatedProduct;
            }
            return p;
          });
          return updated;
        } else if (tx.type === 'Buy') {
          const newId = tx.productId || `RI_${Math.floor(1000 + Math.random() * 9000)}`;
          const newProduct = {
            id: newId, name: tx.product,
            stock: Number(tx.qty) || 0,
            lowStock: (Number(tx.qty) || 0) < 15,
            unitCost: 0,
            production: { C: false, F: false, G: false, P: false }
          };
          // Save new product to MongoDB
          apiCreateProduct(newProduct).catch(() => {});
          return [...prev, newProduct];
        }
        return prev;
      });
    }
  }

  // ── Product CRUD (synced to MongoDB) ─────────────────

  async function handleAddProduct(product) {
    try {
      const saved = await apiCreateProduct(product);
      setProducts(prev => [...prev, saved]);
      showToast('Product added successfully!', 'success');
      return true;
    } catch (err) {
      // Fallback: add locally
      setProducts(prev => [...prev, product]);
      return false;
    }
  }

  async function handleUpdateProduct(productId, data) {
    try {
      const saved = await apiUpdateProduct(productId, data);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...saved } : p));
      showToast('Product updated successfully!', 'success');
      return true;
    } catch (err) {
      // Fallback: update locally
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...data } : p));
      return false;
    }
  }

  async function handleDeleteProduct(productId) {
    try {
      await apiDeleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Product deleted successfully!', 'success');
      return true;
    } catch (err) {
      // Fallback: delete locally
      setProducts(prev => prev.filter(p => p.id !== productId));
      return false;
    }
  }

  // ── Order CRUD (synced to MongoDB) ───────────────────

  async function handleAddOrder(order) {
    try {
      const saved = await apiCreateOrder(order);
      setOrders(prev => [saved, ...prev]);
      showToast('Order created successfully!', 'success');
      return true;
    } catch (err) {
      setOrders(prev => [order, ...prev]);
      return false;
    }
  }

  async function handleUpdateOrder(orderId, data) {
    try {
      const saved = await apiUpdateOrder(orderId, data);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...saved } : o));
      return true;
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
      return false;
    }
  }

  async function handleDeleteOrder(orderId) {
    try {
      await apiDeleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast('Order deleted successfully!', 'success');
      return true;
    } catch (err) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      return false;
    }
  }

  // ── Transaction Update/Delete (synced to MongoDB) ────

  async function handleUpdateTransaction(txId, data) {
    try {
      const saved = await apiUpdateTransaction(txId, data);
      setHistory(prev => prev.map(h => h.id === txId ? { ...h, ...saved } : h));
      showToast('Transaction updated!', 'success');
      return true;
    } catch (err) {
      setHistory(prev => prev.map(h => h.id === txId ? { ...h, ...data } : h));
      return false;
    }
  }

  async function handleDeleteTransaction(txId) {
    try {
      await apiDeleteTransaction(txId);
      setHistory(prev => prev.filter(h => h.id !== txId));
      showToast('Transaction deleted!', 'success');
      return true;
    } catch (err) {
      setHistory(prev => prev.filter(h => h.id !== txId));
      return false;
    }
  }

  // Default redirect path based on role
  function getDefaultPath() {
    if (!user) return '/login';
    return user.role === 'Employee' ? '/employee/dashboard' : '/dashboard';
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#eaf4f8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#3e97b9', marginBottom: '12px' }}>RI</div>
          <p style={{ color: '#64748b' }}>Connecting to database...</p>
        </div>
      </div>
    );
  }

  // Shared DB-synced handlers object
  const dbHandlers = {
    onTransaction: handleTransaction,
    onAddProduct: handleAddProduct,
    onUpdateProduct: handleUpdateProduct,
    onDeleteProduct: handleDeleteProduct,
    onAddOrder: handleAddOrder,
    onUpdateOrder: handleUpdateOrder,
    onDeleteOrder: handleDeleteOrder,
    onUpdateTransaction: handleUpdateTransaction,
    onDeleteTransaction: handleDeleteTransaction,
  };

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
        <Route index element={<Inventory products={products} setProducts={setProducts} {...dbHandlers} />} />
      </Route>

      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Orders orders={orders} setOrders={setOrders} products={products} history={history} {...dbHandlers} />} />
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
        <Route index element={<Transactions history={history} setHistory={setHistory} products={products} {...dbHandlers} />} />
      </Route>

      <Route
        path="/salary"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Salary history={history} setHistory={setHistory} {...dbHandlers} />} />
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
        <Route path="orders" element={<Orders orders={orders} setOrders={setOrders} products={products} history={history} {...dbHandlers} />} />
        <Route path="inventory" element={<Inventory products={products} setProducts={setProducts} {...dbHandlers} />} />
        <Route path="transactions" element={<Transactions history={history} setHistory={setHistory} products={products} {...dbHandlers} />} />
        <Route path="salary" element={<Salary history={history} setHistory={setHistory} {...dbHandlers} />} />
        <Route path="profile" element={<Profile user={user} onUpdateUser={updateUser} />} />
      </Route>

      {/* ── CATCH-ALL → login or dashboard ─────────── */}
      <Route path="*" element={<Navigate to={getDefaultPath()} replace />} />
    </Routes>
  );
}

export default App;
