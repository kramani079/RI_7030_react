const API_BASE = 'http://localhost:5000/api';

// ── Toast Notification System ──────────────────────────
let toastContainer = null;

function getToastContainer() {
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.id = 'ri-toast-container';
  toastContainer.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 99999;
    display: flex; flex-direction: column; gap: 10px;
    pointer-events: none; max-width: 420px;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, type = 'error') {
  const container = getToastContainer();
  const toast = document.createElement('div');

  const colors = {
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', icon: '⚠️' },
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '⚡' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
  };
  const c = colors[type] || colors.error;

  toast.style.cssText = `
    pointer-events: auto;
    display: flex; align-items: flex-start; gap: 10px;
    padding: 14px 18px;
    background: ${c.bg}; border: 1.5px solid ${c.border};
    border-radius: 12px; color: ${c.text};
    font-size: 14px; font-weight: 500; line-height: 1.5;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    animation: riToastSlideIn 0.35s ease-out;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    max-width: 100%;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: ${c.text}; opacity: 0.6;
    padding: 0; margin-left: 8px; flex-shrink: 0;
  `;
  closeBtn.onclick = () => removeToast(toast);

  toast.innerHTML = `<span style="flex-shrink:0;font-size:16px">${c.icon}</span><span style="flex:1">${message}</span>`;
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // Add animation keyframes if not already added
  if (!document.getElementById('ri-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'ri-toast-styles';
    style.textContent = `
      @keyframes riToastSlideIn {
        from { transform: translateX(120%); opacity: 0; }
        to   { transform: translateX(0); opacity: 1; }
      }
      @keyframes riToastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to   { transform: translateX(120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-dismiss after 5 seconds
  setTimeout(() => removeToast(toast), 5000);
}

function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.style.animation = 'riToastSlideOut 0.3s ease-in forwards';
  setTimeout(() => toast.remove(), 300);
}

// ── API Request Helper with Error Handling ─────────────
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned an invalid response');
    }

    if (!res.ok) {
      const errorMsg = data.error || `Request failed (${res.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    // Network errors (server not running, no internet, etc.)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check if the server is running.');
    }
    throw err;
  }
}

// ── Safe wrapper that shows toast on error instead of crashing ──
// GET requests are silent by default (caller handles), write ops show toasts
async function safeRequest(endpoint, options = {}, showError) {
  const isWrite = options.method && options.method !== 'GET';
  const shouldShowError = showError !== undefined ? showError : isWrite;
  try {
    return await request(endpoint, options);
  } catch (err) {
    if (shouldShowError) {
      showToast(err.message || 'Database error occurred', 'error');
    }
    throw err;
  }
}

// Auth
export const apiLogin = (email, password) => safeRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const apiRegister = (userData) => safeRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const apiUpdateProfile = (id, data) => safeRequest(`/auth/profile/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiResetPassword = (email, newPassword) => safeRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, newPassword }) });
export const apiChangePassword = (email, currentPassword, newPassword) => safeRequest('/auth/change-password', { method: 'POST', body: JSON.stringify({ email, currentPassword, newPassword }) });
export const apiGetUsers = () => safeRequest('/auth/users');

// Products
export const apiGetProducts = () => safeRequest('/products');
export const apiCreateProduct = (product) => safeRequest('/products', { method: 'POST', body: JSON.stringify(product) });
export const apiUpdateProduct = (productId, data) => safeRequest(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiDeleteProduct = (productId) => safeRequest(`/products/${productId}`, { method: 'DELETE' });

// Orders
export const apiGetOrders = () => safeRequest('/orders');
export const apiCreateOrder = (order) => safeRequest('/orders', { method: 'POST', body: JSON.stringify(order) });
export const apiUpdateOrder = (orderId, data) => safeRequest(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiDeleteOrder = (orderId) => safeRequest(`/orders/${orderId}`, { method: 'DELETE' });

// Transactions
export const apiGetTransactions = () => safeRequest('/transactions');
export const apiCreateTransaction = (tx) => safeRequest('/transactions', { method: 'POST', body: JSON.stringify(tx) });
export const apiUpdateTransaction = (txId, data) => safeRequest(`/transactions/${txId}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiDeleteTransaction = (txId) => safeRequest(`/transactions/${txId}`, { method: 'DELETE' });

// Health
export const apiHealth = () => safeRequest('/health', {}, false);
