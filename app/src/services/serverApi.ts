import type { User } from "../types";

const TOKEN_KEY = 'bean_score_token';

export const serverApi = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error('Email already exists');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/me`, {
      mode: 'cors',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  deleteAccount: async (): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/auth/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }

    localStorage.removeItem(TOKEN_KEY);
  }
}
