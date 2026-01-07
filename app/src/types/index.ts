export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CoffeePlace {
  id: string;
  userId: string;
  name: string;
  address: string;
  instagramHandle: string;
  coffeeQuality: number;
  ambient: number;
  hasGlutenFree: boolean;
  hasVegMilk: boolean;
  hasVeganFood: boolean;
  hasSugarFree: boolean;
  createdAt: Date;
  updatedAt: Date;
  latitude?: number;
  longitude?: number;
  hasPhoto?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface CoffeePlaceFormData {
  name: string;
  address: string;
  instagramHandle: string;
  coffeeQuality: number;
  ambient: number;
  hasGlutenFree: boolean;
  hasVegMilk: boolean;
  hasVeganFood: boolean;
  hasSugarFree: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SearchFilters {
  searchTerm: string;
  hasGlutenFree: boolean;
  hasVegMilk: boolean;
  hasVeganFood: boolean;
  hasSugarFree: boolean;
}
