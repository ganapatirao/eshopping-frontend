import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'authUser';
const FAILED_ATTEMPTS_KEY = 'failedAttempts';
const LOCKED_ACCOUNTS_KEY = 'lockedAccounts';
const PASSWORD_RESET_KEY = 'passwordResets';

// Predefined accounts
export const SEED_ACCOUNTS = [
  { id: 'admin-1', fullName: 'Admin User', email: 'admin@eshop.com', password: 'admin123', role: 'Admin' },
  { id: 'cust-1', fullName: 'John Customer', email: 'john@eshop.com', password: 'john123', role: 'Customer' },
  { id: 'cust-2', fullName: 'Jane Customer', email: 'jane@eshop.com', password: 'jane123', role: 'Customer' },
];

// Read persisted session synchronously so there is no gap where user is null on refresh
const loadSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('AuthContext: Error loading session:', error);
    return null;
  }
};

// Load failed attempts
const loadFailedAttempts = () => {
  try {
    const attempts = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    return attempts ? JSON.parse(attempts) : {};
  } catch (error) {
    return {};
  }
};

// Load locked accounts
const loadLockedAccounts = () => {
  try {
    const locked = localStorage.getItem(LOCKED_ACCOUNTS_KEY);
    return locked ? JSON.parse(locked) : {};
  } catch (error) {
    return {};
  }
};

// Load password resets
const loadPasswordResets = () => {
  try {
    const resets = localStorage.getItem(PASSWORD_RESET_KEY);
    return resets ? JSON.parse(resets) : {};
  } catch (error) {
    return {};
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadSession);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(loadFailedAttempts);
  const [lockedAccounts, setLockedAccounts] = useState(loadLockedAccounts);

  const login = (email, password) => {
    const emailLower = email.trim().toLowerCase();
    
    // Check if account is locked
    if (lockedAccounts[emailLower] && lockedAccounts[emailLower].locked) {
      const lockTime = new Date(lockedAccounts[emailLower].lockedAt);
      const now = new Date();
      const timeDiff = now - lockTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return { ok: false, error: 'Account is locked. Please contact admin to unlock.' };
      } else {
        // Auto-unlock after 24 hours
        const newLocked = { ...lockedAccounts };
        delete newLocked[emailLower];
        setLockedAccounts(newLocked);
        localStorage.setItem(LOCKED_ACCOUNTS_KEY, JSON.stringify(newLocked));
      }
    }

    const match = SEED_ACCOUNTS.find(
      (u) => u.email.toLowerCase() === emailLower && u.password === password
    );

    if (!match) {
      // Increment failed attempts
      const currentAttempts = (failedAttempts[emailLower] || 0) + 1;
      const newFailedAttempts = { ...failedAttempts, [emailLower]: currentAttempts };
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(newFailedAttempts));

      // Lock account after 3 failed attempts
      if (currentAttempts >= 3) {
        const newLocked = {
          ...lockedAccounts,
          [emailLower]: { locked: true, lockedAt: new Date().toISOString() }
        };
        setLockedAccounts(newLocked);
        localStorage.setItem(LOCKED_ACCOUNTS_KEY, JSON.stringify(newLocked));
        
        // Reset failed attempts after locking
        const resetAttempts = { ...newFailedAttempts };
        delete resetAttempts[emailLower];
        setFailedAttempts(resetAttempts);
        localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(resetAttempts));
        
        return { ok: false, error: 'Account locked due to too many failed attempts. Please contact admin.' };
      }

      const remainingAttempts = 3 - currentAttempts;
      return { ok: false, error: `Invalid email or password. ${remainingAttempts} attempts remaining.` };
    }

    // Reset failed attempts on successful login
    const resetAttempts = { ...failedAttempts };
    delete resetAttempts[emailLower];
    setFailedAttempts(resetAttempts);
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(resetAttempts));

    const session = {
      id: match.id,
      fullName: match.fullName,
      email: match.email,
      role: match.role,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);

    return { ok: true, role: session.role };
  };

  // Admin function to unlock an account
  const unlockAccount = (email) => {
    const emailLower = email.trim().toLowerCase();
    const newLocked = { ...lockedAccounts };
    delete newLocked[emailLower];
    setLockedAccounts(newLocked);
    localStorage.setItem(LOCKED_ACCOUNTS_KEY, JSON.stringify(newLocked));
    
    // Also reset failed attempts
    const resetAttempts = { ...failedAttempts };
    delete resetAttempts[emailLower];
    setFailedAttempts(resetAttempts);
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(resetAttempts));
    
    return { ok: true };
  };

  // Request password reset
  const requestPasswordReset = (email) => {
    const emailLower = email.trim().toLowerCase();
    const account = SEED_ACCOUNTS.find(u => u.email.toLowerCase() === emailLower);
    
    if (!account) {
      // Don't reveal if email exists for security
      return { ok: true, message: 'If the email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    const passwordResets = loadPasswordResets();
    passwordResets[resetToken] = {
      email: emailLower,
      expiresAt: expiresAt.toISOString(),
    };

    localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(passwordResets));

    return { ok: true, message: 'If the email exists, a reset link has been sent.', token: resetToken };
  };

  // Reset password
  const resetPassword = (token, newPassword) => {
    const passwordResets = loadPasswordResets();
    const reset = passwordResets[token];

    if (!reset) {
      return { ok: false, error: 'Invalid or expired reset token' };
    }

    const now = new Date();
    if (now > new Date(reset.expiresAt)) {
      delete passwordResets[token];
      localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(passwordResets));
      return { ok: false, error: 'Reset token has expired' };
    }

    // Update password in seed accounts (in a real app, this would be an API call)
    const account = SEED_ACCOUNTS.find(u => u.email.toLowerCase() === reset.email);
    if (account) {
      account.password = newPassword;
    }

    // Clean up reset token
    delete passwordResets[token];
    localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(passwordResets));

    // Reset failed attempts for this email
    const resetAttempts = { ...failedAttempts };
    delete resetAttempts[reset.email];
    setFailedAttempts(resetAttempts);
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(resetAttempts));

    return { ok: true, message: 'Password has been reset successfully.' };
  };

  const register = ({ fullName, email, password }) => {
    // For demo purposes, registration just logs in as a customer
    const session = { 
      id: 'user-' + Date.now().toString(36),
      fullName: fullName.trim(),
      email: email.trim(),
      role: 'Customer'
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, accounts: SEED_ACCOUNTS, login, register, logout, unlockAccount, requestPasswordReset, resetPassword, lockedAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
