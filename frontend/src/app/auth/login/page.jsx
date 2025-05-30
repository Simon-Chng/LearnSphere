'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/auth.module.css';
import { authService } from '@/services/auth';

/**
 * LoginPage component for user authentication.
 * Allows users to log in using a username and password or continue as a guest.
 * Redirects authenticated users to the home page.
 *
 * @component
 * @returns {JSX.Element|null} The login form or null if the component has not yet mounted.
 */
export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  /**
   * Handles form input changes.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Submits the login form and attempts to authenticate the user.
   * Saves the token to localStorage and redirects to the home page if successful.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authService.login(formData.username, formData.password);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('isGuest', 'false');
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enables guest mode by setting a flag in localStorage and redirecting to home.
   */
  const handleGuestMode = () => {
    localStorage.setItem('isGuest', 'true');
    router.push('/');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Login</h1>
        
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            required
            disabled={isLoading}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button 
          type="submit" 
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className={styles.link}>
          Don't have an account? <Link href="/auth/signup">Sign up</Link>
        </div>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button 
          type="button" 
          className={styles.guestButton}
          onClick={handleGuestMode}
          disabled={isLoading}
        >
          Continue as Guest
        </button>
      </form>
    </div>
  );
}
