// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // <-- 1. ADD LOADING STATE

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const decoded = jwtDecode(storedToken);
        setUser(decoded.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false); // <-- 2. SET LOADING TO FALSE AFTER CHECK IS COMPLETE
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setToken(response.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const updateToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken); // This will re-run the useEffect and update the user state
  };

  const authContextValue = {
    user,
    token,
    loading, // <-- 3. EXPOSE LOADING STATE
    login,
    logout,
    updateToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}