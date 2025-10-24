import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
      
      checkAuthStatus: () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }
        
        // 在实际应用中，这里可能需要验证token的有效性
        // 对于JWT token，我们可以检查它是否过期
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp < currentTime) {
            // Token已过期
            set({ 
              user: null, 
              accessToken: null, 
              isAuthenticated: false 
            });
          } else {
            set({ isAuthenticated: true });
          }
        } catch (error) {
          // Token无效
          set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: "auth-storage", // 存储在localStorage中的键名
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);