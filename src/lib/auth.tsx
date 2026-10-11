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

// Signed-in visitors are signed out after this long without any activity.
// Activity in any open tab counts (shared through localStorage).
export const IDLE_LOGOUT_MS = 10 * 60 * 1000;
const ACTIVITY_KEY = "lastActivity";
// Set when the idle timer signed someone out, so the login page can say why.
export const IDLE_FLAG = "loggedOutIdle";

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

  useEffect(() => {
    if (!user) return;
    const read = () => {
      try {
        return Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now();
      } catch {
        return Date.now();
      }
    };
    let last = Date.now();
    const write = (now: number) => {
      last = now;
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {
        /* ignore */
      }
    };
    write(Date.now());
    // Mouse moves fire constantly; record at most every 5 seconds.
    const onActivity = () => {
      const now = Date.now();
      if (now - last > 5000) write(now);
    };
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, onActivity, { passive: true });
    const timer = window.setInterval(() => {
      if (Date.now() - Math.max(last, read()) < IDLE_LOGOUT_MS) return;
      // The account and admin pages send signed-out visitors to /login,
      // which then explains what happened.
      if (/^\/(account|admin)/.test(window.location.pathname)) {
        try {
          sessionStorage.setItem(IDLE_FLAG, "1");
        } catch {
          /* ignore */
        }
      }
      void supabase.auth.signOut();
    }, 15000);
    return () => {
      for (const e of events) window.removeEventListener(e, onActivity);
      window.clearInterval(timer);
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ user, isAdmin, ready, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
