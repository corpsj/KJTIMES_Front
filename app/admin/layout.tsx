"use client";

import "./admin2.css";
import { useEffect, useState } from "react";
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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/admin/login");
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase, isLoginPage]);

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

  // Loading state
  if (loading) {
    return (
      <MantineProvider theme={adminTheme} defaultColorScheme="light">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#f8f9fa",
            color: "#868e96",
            fontSize: 14,
          }}
        >
          CMS 로딩 중...
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
            background: "#f8f9fa",
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
