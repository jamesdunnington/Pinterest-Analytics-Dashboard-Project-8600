import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../lib/supabase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      // Initialize auth state
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                avatar: session.user.user_metadata?.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
                timezone: session.user.user_metadata?.timezone || 'Asia/Singapore'
              }
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
        }
      },

      // Sign up with email and password
      signUp: async (email, password, userData = {}) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: userData.name || '',
                avatar_url: userData.avatar_url || '',
                timezone: userData.timezone || 'Asia/Singapore'
              }
            }
          });

          if (error) throw error;
          
          return { success: true, data };
        } catch (error) {
          console.error('Sign up error:', error);
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Sign in with email and password
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          const user = data.user;
          set({
            user: {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0],
              avatar: user.user_metadata?.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
              timezone: user.user_metadata?.timezone || 'Asia/Singapore'
            },
            isLoading: false
          });
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Sign out
      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      // Update user profile
      updateUser: async (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          try {
            const { data, error } = await supabase.auth.updateUser({
              data: updates
            });
            
            if (error) throw error;
            
            set({
              user: {
                ...currentUser,
                ...updates
              }
            });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'No user logged in' };
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.setState({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        avatar: session.user.user_metadata?.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
        timezone: session.user.user_metadata?.timezone || 'Asia/Singapore'
      }
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null });
  }
});