import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get current session from local storage immediately to prevent profile disappearance
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Validate session in background without clearing existing user state on network delay
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) {
        setUser(data.user);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const handleCustomUpdate = () => {
      supabase.auth.getUser().then(({ data }) => {
        if (!mounted) return;
        if (data.user) {
          setUser(data.user);
        }
      });
    };

    window.addEventListener("northlane_user_profile_updated", handleCustomUpdate);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("northlane_user_profile_updated", handleCustomUpdate);
    };
  }, []);

  return { user, loading };
}
