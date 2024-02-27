import { createContext, useContext, useEffect, useState } from 'react';
import axios from '~/api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState('');

  const [searchVl, setSearchVl] = useState();

  const csrf = () => axios.get('/sanctum/csrf-cookie');

  const getSearch = async (q) => {
    try {
      await axios.get('/api/search', {
        params: {
          q: searchVl,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getUser = async () => {
    try {
      let token = localStorage.getItem('token');
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const res = await axios.get('/api/user', { params: { token } });
      setUser(res.data);
    } catch (errors) {
      console.log(errors);
    }
  };
  const Logout = async () => {
    await csrf();
    try {
      let token = localStorage.getItem('token');
      const result = await axios.post('api/logout', { params: { token } });
      if (result && token) {
        localStorage.removeItem('token');
        window.location.reload();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const login = async ({ ...data }) => {
    await csrf();
    try {
      const result = await axios.post('/api/login', data);
      if (result && result.data) {
        localStorage.setItem('token', result.data.authorization.token);
        getUser();
        navigate('/');
      }
    } catch (e) {
      console.log(e);
    }
  };
  const register = async ({ ...data }) => {
    await csrf();
    try {
      await axios.post('/api/register', data);
      getUser();
      navigate('/');
    } catch (e) {
      if (e.response.status === 422) {
        setErrors(e.response.data.errors);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, errors, getUser, getSearch, login, register, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}