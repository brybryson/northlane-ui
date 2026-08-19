import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check local session first to prevent false redirects to /auth when user is logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (session?.user && !sessionError) {
      return { user: session.user };
    }

    // Secondary fallback check with getUser()
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
