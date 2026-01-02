import type { CoffeePlace, CoffeePlaceFormData, User } from "../types";

const TOKEN_KEY = 'bean_score_token';

export const serverApi = {
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
  },

  getPlaces: async (): Promise<CoffeePlace[]> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/coffee-places`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch places: ' + response.statusText);
    }

    const places = await response.json();
    return places;
  },

  getPlace: async (id: string): Promise<CoffeePlace | null> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/coffee-places/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch place: ' + response.statusText);
    }

    const place = await response.json();
    return place;
  },

  createPlace: async (data: CoffeePlaceFormData): Promise<CoffeePlace> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/coffee-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) {
      throw new Error('Failed to create place: ' + response.statusText);
    }

    const newPlace: CoffeePlace = await response.json();
    return newPlace;
  },

  updatePlace: async (id: string, data: CoffeePlaceFormData): Promise<CoffeePlace> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/coffee-places/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) {
      throw new Error('Failed to update place: ' + response.statusText);
    }

    const updatedPlace: CoffeePlace = await response.json();
    return updatedPlace;
  },

  deletePlace: async (id: string): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/coffee-places/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete place: ' + response.statusText);
    }
  }
}
