import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Application Header component.
 *
 * - Displays navigation icons (home, apps, PDF, admin).
 * - Shows current user identity (guest or logged in).
 * - Decodes JWT to extract username.
 * - Fetches user role to determine admin status.
 * - Allows user to toggle sidebar and perform login/logout.
 *
 * @component
 * @param {Object} props
 * @param {() => void} props.onToggleSidebar - Callback to toggle sidebar visibility
 * @returns {JSX.Element}
 */
export default function Header({ onToggleSidebar }) {
  const [username, setUsername] = useState("Guest");
  const [isGuest, setIsGuest] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const guestMode = localStorage.getItem('isGuest') === 'true';
    setIsGuest(guestMode);
    if (!guestMode) {
      const token = localStorage.getItem('token');
      if (token) {
        // Decode JWT token to get username
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUsername(payload.sub || "Guest");
          
          // Get user info and check if user is admin
          fetch('http://localhost:8000/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.is_admin) {
              setIsAdmin(true);
            }
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
          });
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }, []);

  /**
   * Handles user action when clicking the username section.
   *
   * - If guest, navigates to login page.
   * - If logged in, logs out by clearing token and switching to guest mode,
   *   then redirects to home and reloads the page.
   *
   * @function
   * @returns {void}
   */
  const handleUserAction = () => {
    if (isGuest) {
      router.push('/auth/login');
    } else {
      localStorage.removeItem('token');
      localStorage.setItem('isGuest', 'true');
      setUsername("Guest");
      setIsGuest(true);
      setIsAdmin(false);
      router.push('/');
      // Add a small delay before refreshing to ensure state updates
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  return (
    <div className="app-header">
      <button onClick={onToggleSidebar} className="app-logo">
        <svg className="menu-icon">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <Link href="/" className="home-button">
        <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>
      <Link href="/apps" className="apps-button">
        <svg className="apps-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </Link>
      <Link href="/pdf" className="pdf-button">
        <svg className="pdf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </Link>
      {isAdmin && (
        <Link href="/admin" className="admin-button">
          <svg className="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </Link>
      )}
      <div className="user-info" onClick={handleUserAction}>
        <span className="username">{username}</span>
        <span className="user-action">{isGuest ? "Login" : "Logout"}</span>
      </div>
    </div>
  );
}
