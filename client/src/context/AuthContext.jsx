// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getMyProfile } from '../services/api'; // 1. Import getMyProfile

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // From the token (for auth rules)
  const [profile, setProfile] = useState(null); // Full profile data (for display)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const decoded = jwtDecode(storedToken);
          setUser(decoded.user);

          // If the token says we have a profile, fetch its details for the UI
          if (decoded.user.hasProfile) {
            const profileResponse = await getMyProfile();
            setProfile(profileResponse.data);
          }

        } catch (error) {
          // This will catch invalid/expired tokens
          console.error("Auth initialization error:", error);
          localStorage.removeItem('token');
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setToken(response.data.token); // This triggers the useEffect to run again
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null); // Clear profile on logout
  };
  
  const updateToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken); // This triggers the useEffect to run again
  };

  const authContextValue = {
    user,
    profile, // 2. Expose the profile data
    token,
    loading,
    login,
    logout,
    updateToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children} {/* Only render children when auth check is complete */}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}