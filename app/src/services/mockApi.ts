import type { User, CoffeePlace, CoffeePlaceFormData } from '../types';

// Mock storage keys
const USERS_KEY = 'bean_score_users';
const PLACES_KEY = 'bean_score_places';
const TOKEN_KEY = 'bean_score_token';

// Helper functions for localStorage
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getPlaces = (): CoffeePlace[] => {
  const places = localStorage.getItem(PLACES_KEY);
  if (!places) return [];

  // Parse and convert date strings back to Date objects
  const parsed = JSON.parse(places);
  return parsed.map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
};

const savePlaces = (places: CoffeePlace[]) => {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
};

// Mock API functions
export const mockApi = {
  // // Auth
  // login: async (email: string, _password: string): Promise<{ user: User; token: string }> => {
  //   await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  //   const users = getUsers();
  //   const user = users.find(u => u.email === email);

  //   if (!user || _password !== 'password') { // Mock password check
  //     throw new Error('Invalid credentials');
  //   }

  //   const token = `mock_token_${user.id}`;
  //   localStorage.setItem(TOKEN_KEY, token);

  //   return { user, token };
  // },

  // register: async (email: string, _password: string, name: string): Promise<{ user: User; token: string }> => {
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const users = getUsers();

  //   if (users.find(u => u.email === email)) {
  //     throw new Error('Email already exists');
  //   }

  //   const newUser: User = {
  //     id: `user_${Date.now()}`,
  //     email,
  //     name,
  //   };

  //   users.push(newUser);
  //   saveUsers(users);

  //   const token = `mock_token_${newUser.id}`;
  //   localStorage.setItem(TOKEN_KEY, token);

  //   return { user: newUser, token };
  // },

  // getCurrentUser: async (): Promise<User | null> => {
  //   await new Promise(resolve => setTimeout(resolve, 200));

  //   const token = localStorage.getItem(TOKEN_KEY);
  //   if (!token) return null;

  //   const userId = token.replace('mock_token_', '');
  //   const users = getUsers();
  //   return users.find(u => u.id === userId) || null;
  // },

  // logout: () => {
  //   localStorage.removeItem(TOKEN_KEY);
  // },

  // deleteAccount: async (userId: string): Promise<void> => {
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   // Remove user
  //   const users = getUsers();
  //   const updatedUsers = users.filter(u => u.id !== userId);
  //   saveUsers(updatedUsers);

  //   // Remove user's places
  //   const places = getPlaces();
  //   const updatedPlaces = places.filter(p => p.userId !== userId);
  //   savePlaces(updatedPlaces);

  //   // Clear token
  //   localStorage.removeItem(TOKEN_KEY);
  // },

  // Coffee Places
  getPlaces: async (userId: string): Promise<CoffeePlace[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const places = getPlaces();
    return places.filter(p => p.userId === userId);
  },

  getPlace: async (id: string): Promise<CoffeePlace | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const places = getPlaces();
    return places.find(p => p.id === id) || null;
  },

  createPlace: async (userId: string, data: CoffeePlaceFormData): Promise<CoffeePlace> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPlace: CoffeePlace = {
      id: `place_${Date.now()}`,
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const places = getPlaces();
    places.push(newPlace);
    savePlaces(places);

    return newPlace;
  },

  updatePlace: async (id: string, data: CoffeePlaceFormData): Promise<CoffeePlace> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const places = getPlaces();
    const index = places.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('Place not found');
    }

    const updatedPlace: CoffeePlace = {
      ...places[index],
      ...data,
      updatedAt: new Date(),
    };

    places[index] = updatedPlace;
    savePlaces(places);

    return updatedPlace;
  },

  deletePlace: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const places = getPlaces();
    const updatedPlaces = places.filter(p => p.id !== id);
    savePlaces(updatedPlaces);
  },
};
