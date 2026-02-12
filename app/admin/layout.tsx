"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MantineProvider } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { adminTheme } from "./theme";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  const checkUser = useCallback(async () => {
    if (isLoginPage) {
      setLoading(false);
      setInitialCheckDone(true);
      return;
    }

    try {
      // Try getSession first (faster, from local storage)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        setInitialCheckDone(true);
        // Verify in background
        supabase.auth.getUser().then(({ data: { user: verifiedUser } }) => {
          if (!verifiedUser) {
            setUser(null);
            router.push("/admin/login");
          } else {
            setUser(verifiedUser);
          }
        });
        return;
      }

      // Fallback to full verification
      const { data: { user: verifiedUser } } = await supabase.auth.getUser();
      if (!verifiedUser) {
        router.push("/admin/login");
      } else {
        setUser(verifiedUser);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [supabase, isLoginPage, router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Login page: no sidebar, just render children
  if (isLoginPage) {
    return (
      <MantineProvider theme={adminTheme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    );
  }

  // Loading state — show a minimal spinner
  if (loading || !initialCheckDone) {
    return (
      <MantineProvider theme={adminTheme} defaultColorScheme="light">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "var(--mantine-color-gray-0)",
            color: "var(--mantine-color-gray-6)",
            fontSize: 14,
            gap: 8,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid var(--mantine-color-gray-3)",
              borderTopColor: "var(--mantine-color-blue-6)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </MantineProvider>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || "Administrator";

  return (
    <MantineProvider theme={adminTheme} defaultColorScheme="light">
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar userName={userName} onLogout={handleLogout} />
        <main
          style={{
            marginLeft: 260,
            flex: 1,
            background: "var(--mantine-color-gray-0)",
            minHeight: "100vh",
            padding: 24,
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </MantineProvider>
  );
}
