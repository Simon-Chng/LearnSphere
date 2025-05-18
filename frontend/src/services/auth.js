const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * A service for handling authentication-related operations.
 * @namespace authService
 */
export const authService = {
  /**
   * Logs in a user by sending their credentials to the backend.
   *
   * @async
   * @function
   * @memberof authService
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} The authentication token and related user info.
   * @throws Will throw an error if the login request fails.
   */
  async login(username, password) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      console.log('Attempting login with:', { username });
      
      const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error:', error);
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Registers a new user by sending their details to the backend.
   *
   * @async
   * @function
   * @memberof authService
   * @param {string} username - The desired username.
   * @param {string} email - The email address of the new user.
   * @param {string} password - The password for the new account.
   * @returns {Promise<Object>} The newly created user information.
   * @throws Will throw an error if the registration request fails.
   */
  async register(username, email, password) {
    try {
      console.log('Attempting registration with:', { username, email });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Registration error:', error);
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful');
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Retrieves the currently authenticated user's information using a bearer token.
   *
   * @async
   * @function
   * @memberof authService
   * @param {string} token - The bearer token for the authenticated user.
   * @returns {Promise<Object>} The authenticated user's information.
   * @throws Will throw an error if the request fails or the token is invalid.
   */
  async getCurrentUser(token) {
    try {
      console.log('Fetching current user');
      
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to get user data');
        throw new Error('Failed to get user data');
      }

      const data = await response.json();
      console.log('User data fetched successfully');
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};
