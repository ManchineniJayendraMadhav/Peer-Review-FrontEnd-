import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/signin', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return true;
      }
    } catch (error) {
      console.error("Login Error", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/signup', userData);
      return true;
    } catch (error) {
      console.error("Register Error", error);
      return false;
    }
  };

  const isTeacher = user?.roles?.includes('ROLE_TEACHER') || false;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isTeacher }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
