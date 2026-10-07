import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  isAdmin: boolean;
  // false until the stored session (if any) has been read
  ready: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, isAdmin: false, ready: false, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      setUser(s.session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let live = true;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (live) setIsAdmin(data === true);
    });
    return () => {
      live = false;
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ user, isAdmin, ready, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
