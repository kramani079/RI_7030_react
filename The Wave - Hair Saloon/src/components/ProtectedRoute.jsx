import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * ─────────────────────────────────────────
 * If no user → redirect to /login
 * If allowedRole supplied and doesn't match → redirect to correct panel
 * Otherwise → render children
 */
export default function ProtectedRoute({ allowedRole, children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Send user to their own panel
        const target = user.role === 'Employee' ? '/employee/dashboard' : '/dashboard';
        return <Navigate to={target} replace />;
    }

    return children;
}
