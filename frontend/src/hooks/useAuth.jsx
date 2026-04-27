// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, signOut as apiSignOut, getCachedUser } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedUser();
    if (!cached) { setProfile(null); setLoading(false); return; }

    // Verify token still valid by hitting /auth/me
    getProfile()
      .then(setProfile)
      .catch(() => { setProfile(null); })
      .finally(() => setLoading(false));
  }, []);

  const value = {
    profile,
    loading,
    isAdmin:       profile?.role === "admin",
    isKitchen:     profile?.role === "kitchen_staff" || profile?.role === "admin",
    isSiteManager: profile?.role === "site_manager",
    siteId:        profile?.site_id,
    siteName:      profile?.site_name,
    refreshProfile: async () => {
      const p = await getProfile();
      setProfile(p);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export { apiSignOut as signOut };
