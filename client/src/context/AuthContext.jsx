import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore } from '../services/api';
import { authService } from '../services/auth';
import { clearStore } from '../lib/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);
  // True after an explicit log out, so the route guard sends the user home instead of to /login.
  const [signedOut, setSignedOut] = useState(false);

  const restore = useCallback(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setBootError(null);
    authService
      .me()
      .then(setUser)
      .catch((err) => {
        // A dead server is not a reason to throw the session away; only a rejected token is.
        if (err.isNetwork) setBootError(err);
        else tokenStore.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(restore, [restore]);

  useEffect(() => {
    const onExpired = () => {
      clearStore();
      setUser(null);
    };
    window.addEventListener('taskcollab:session-expired', onExpired);
    return () => window.removeEventListener('taskcollab:session-expired', onExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      bootError,
      signedOut,
      retry: restore,
      async login({ email, password, remember = true }) {
        const { token, user: u } = await authService.login({ email, password });
        tokenStore.set(token, remember);
        setSignedOut(false);
        setUser(u);
        return u;
      },
      async register({ name, email, password }) {
        const { token, user: u } = await authService.register({ name, email, password });
        tokenStore.set(token, true);
        setSignedOut(false);
        setUser(u);
        return u;
      },
      logout() {
        tokenStore.clear();
        clearStore();
        setSignedOut(true);
        setUser(null);
      },
      setUser,
    }),
    [user, loading, bootError, signedOut, restore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
