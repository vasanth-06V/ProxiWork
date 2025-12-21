import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, getMyProfile } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null); // Holds Full Name, Avatar, etc.
    const [loading, setLoading] = useState(true);

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    // --- HELPER: Fetch Profile from DB ---
    const fetchProfileData = async () => {
        try {
            const response = await getMyProfile();
            console.log("✅ Profile Fetched:", response.data); 
            setProfile(response.data);
        } catch (err) {
            console.error("❌ Could not fetch profile:", err);
            setProfile(null);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = parseJwt(token);
                // Check if token is valid
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    setUser(decoded.user);
                    
                    // IF user has a profile, fetch the details immediately
                    if (decoded.user.hasProfile) {
                        await fetchProfileData();
                    }
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                    setProfile(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await loginUser({ email, password });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        const decoded = parseJwt(token);
        setUser(decoded.user);

        // Fetch profile immediately after login if they have one
        if (decoded.user.hasProfile) {
            await fetchProfileData();
        }
        
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
    };

    // Called after "Save Profile" to update token and fetch new data
    const updateToken = async (newToken) => {
        localStorage.setItem('token', newToken);
        const decoded = parseJwt(newToken);
        setUser(decoded.user);
        await fetchProfileData();
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