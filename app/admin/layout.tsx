"use client";

import "./admin2.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Noto_Serif_KR } from "next/font/google";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const displayFont = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--admin2-display",
});

const navItems = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/articles", label: "기사 데스크" },
  { href: "/admin/write", label: "작성 스튜디오" },
  { href: "/admin/media", label: "미디어" },
  { href: "/admin/news-feed", label: "뉴스 피드" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className={`admin2 admin2-shell ${displayFont.variable}`}>
        <div className="admin2-body">
          <div className="admin2-panel">CMS 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || "Administrator";
  const userInitial = userName?.[0]?.toUpperCase() || "A";
  const currentNavLabel = navItems.find((item) => pathname === item.href)?.label || "기사 데스크";

  return (
    <div className={`admin2 admin2-shell ${displayFont.variable}`}>
      <header className="admin2-topbar">
        <div className="admin2-topbar-row">
          <div className="admin2-brand">
            <Image
              src="/brand/KJ_sloganLogo.png"
              alt="Kwangjeon Times"
              width={320}
              height={58}
              className="admin2-brand-logo"
              priority
            />
            <div className="admin2-brand-title admin2-display">광전타임즈 편집국</div>
          </div>
          <div className="admin2-badge">{currentNavLabel}</div>
          <div className="admin2-user">
            <div className="admin2-avatar">{userInitial}</div>
            <div className="admin2-user-meta">
              <span className="admin2-user-name">{userName}</span>
              <span className="admin2-user-role">편집 데스크</span>
            </div>
            <button className="admin2-link" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
        <div className="admin2-topbar-row admin2-topbar-row--nav">
          <nav className="admin2-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="admin2-actions">
            <Link className="admin2-btn admin2-btn-ghost" href="/" target="_blank">
              사이트 보기
            </Link>
            <Link className="admin2-btn admin2-btn-ghost" href="/admin/articles">
              기사 관리
            </Link>
            <Link className="admin2-btn admin2-btn-accent" href="/admin/write">
              속보 작성
            </Link>
          </div>
        </div>
      </header>
      <main className="admin2-body">{children}</main>
    </div>
  );
}
