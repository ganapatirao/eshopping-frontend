import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'users';
const SESSION_KEY = 'authUser';

// Predefined accounts (shown on the login page for quick access)
export const SEED_ACCOUNTS = [
  { id: 'admin-1', fullName: 'Admin User', email: 'admin@eshop.com', password: 'admin123', role: 'Admin' },
  { id: 'cust-1', fullName: 'John Customer', email: 'john@eshop.com', password: 'john123', role: 'Customer' },
  { id: 'cust-2', fullName: 'Jane Customer', email: 'jane@eshop.com', password: 'jane123', role: 'Customer' },
];

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    let users = raw ? JSON.parse(raw) : [];
    // Ensure all seed accounts exist
    let changed = false;
    SEED_ACCOUNTS.forEach((acct) => {
      if (!users.some((u) => u.email === acct.email)) {
        users.push(acct);
        changed = true;
      }
    });
    if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  } catch {
    return [...SEED_ACCOUNTS];
  }
};

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSession);

  useEffect(() => {
    // Ensure demo user exists on first load
    readUsers();
  }, []);

  const login = (email, password) => {
    const users = readUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) {
      return { ok: false, error: 'Invalid email or password' };
    }
    const session = { id: match.id, fullName: match.fullName, email: match.email, role: match.role || 'Customer' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('userId', match.id);
    setUser(session);
    return { ok: true, role: session.role };
  };

  const register = ({ fullName, email, password }) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists' };
    }
    const newUser = {
      id: 'user-' + Date.now().toString(36),
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role: 'Customer',
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = { id: newUser.id, fullName: newUser.fullName, email: newUser.email, role: newUser.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('userId', newUser.id);
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('userId');
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, accounts: SEED_ACCOUNTS, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
