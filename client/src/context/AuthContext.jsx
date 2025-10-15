// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // We will install this library next

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded.user);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    setToken(response.data.token);
  };

  const logout = () => {
    setToken(null);
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
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