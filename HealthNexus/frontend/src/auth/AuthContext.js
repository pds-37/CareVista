import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AUTH_STORAGE_KEY = 'carevista-auth';
const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return { token: '', user: null };
    }

    const parsed = JSON.parse(raw);

    return {
      token: parsed.token || '',
      user: parsed.user || null,
    };
  } catch (error) {
    return { token: '', user: null };
  }
};

const applyToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const storedSession = readStoredSession();

    applyToken(storedSession.token);

    if (!storedSession.token) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const hydrateSession = async () => {
      try {
        const { data } = await api.get('/auth/me');

        if (mounted) {
          const nextSession = {
            token: storedSession.token,
            user: data.user,
          };

          setSession(nextSession);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        }
      } catch (error) {
        if (mounted) {
          setSession({ token: '', user: null });
          localStorage.removeItem(AUTH_STORAGE_KEY);
          applyToken('');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = (nextSession) => {
    setSession(nextSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    applyToken(nextSession.token);
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    persistSession({ token: data.token, user: data.user });
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persistSession({ token: data.token, user: data.user });
    return data.user;
  };

  const logout = () => {
    setSession({ token: '', user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    applyToken('');
  };

  const refreshUser = async () => {
    if (!session.token) {
      return null;
    }

    const { data } = await api.get('/auth/me');
    const nextSession = {
      token: session.token,
      user: data.user,
    };

    persistSession(nextSession);
    return data.user;
  };

  const value = useMemo(
    () => ({
      loading,
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [loading, session.token, session.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};
