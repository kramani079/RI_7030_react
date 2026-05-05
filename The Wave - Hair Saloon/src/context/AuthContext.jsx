import { createContext, useContext, useState } from 'react';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Custom hook for easy consumption
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}

// 3. Provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    });

    /** Call after verifying credentials */
    function login(userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    /** Clear session */
    function logout() {
        setUser(null);
        localStorage.removeItem('user');
    }

    /** Partial-update helper (profile edits) */
    function updateUser(partial) {
        setUser(prev => {
            const updated = { ...prev, ...partial };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
