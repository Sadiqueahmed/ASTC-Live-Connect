import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  addedAt: string;
}

export interface FavoriteStop {
  id: string;
  name: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  routeId: string;
  routeNumber?: string;
  addedAt: string;
}

interface FavoritesState {
  favoriteRoutes: FavoriteRoute[];
  favoriteStops: FavoriteStop[];
  
  // Route actions
  addFavoriteRoute: (route: Omit<FavoriteRoute, 'addedAt'>) => void;
  removeFavoriteRoute: (routeId: string) => void;
  isFavoriteRoute: (routeId: string) => boolean;
  
  // Stop actions
  addFavoriteStop: (stop: Omit<FavoriteStop, 'addedAt'>) => void;
  removeFavoriteStop: (stopId: string) => void;
  isFavoriteStop: (stopId: string) => boolean;
  
  // Bulk actions
  clearAllFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteRoutes: [],
      favoriteStops: [],
      
      addFavoriteRoute: (route) => {
        const exists = get().favoriteRoutes.some(r => r.id === route.id);
        if (exists) return;
        
        set((state) => ({
          favoriteRoutes: [
            ...state.favoriteRoutes,
            { ...route, addedAt: new Date().toISOString() }
          ]
        }));
      },
      
      removeFavoriteRoute: (routeId) => {
        set((state) => ({
          favoriteRoutes: state.favoriteRoutes.filter(r => r.id !== routeId)
        }));
      },
      
      isFavoriteRoute: (routeId) => {
        return get().favoriteRoutes.some(r => r.id === routeId);
      },
      
      addFavoriteStop: (stop) => {
        const exists = get().favoriteStops.some(s => s.id === stop.id);
        if (exists) return;
        
        set((state) => ({
          favoriteStops: [
            ...state.favoriteStops,
            { ...stop, addedAt: new Date().toISOString() }
          ]
        }));
      },
      
      removeFavoriteStop: (stopId) => {
        set((state) => ({
          favoriteStops: state.favoriteStops.filter(s => s.id !== stopId)
        }));
      },
      
      isFavoriteStop: (stopId) => {
        return get().favoriteStops.some(s => s.id === stopId);
      },
      
      clearAllFavorites: () => {
        set({ favoriteRoutes: [], favoriteStops: [] });
      }
    }),
    {
      name: 'astc-favorites-storage',
    }
  )
);
