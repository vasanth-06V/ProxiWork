import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null); // Optional: if you fetch full profile on load
    const [loading, setLoading] = useState(true);

    // Helper: Decode JWT manually (avoiding extra npm dependencies)
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        // Check for token on app start
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = parseJwt(token);
            // Check if token is expired
            if (decoded && decoded.exp * 1000 > Date.now()) {
                setUser(decoded.user);
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await loginUser({ email, password });
        const { token } = response.data;
        
        // 1. Save Token
        localStorage.setItem('token', token);
        
        // 2. Decode & Set User
        const decoded = parseJwt(token);
        setUser(decoded.user);
        
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
        // Optional: Redirect to login handled by ProtectedRoute or component logic
    };

    // Called after "Create Profile" to update the 'hasProfile' flag in the token
    const updateToken = (newToken) => {
        localStorage.setItem('token', newToken);
        const decoded = parseJwt(newToken);
        setUser(decoded.user);
    };

    return (
        <AuthContext.Provider value={{ user, profile, login, logout, updateToken, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}