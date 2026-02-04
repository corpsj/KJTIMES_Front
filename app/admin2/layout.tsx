"use client";

import "./admin2.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Noto_Serif_KR } from "next/font/google";
import { createClient } from "@/utils/supabase/client";

const displayFont = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--admin2-display",
});

const navItems = [
  { href: "/admin2", label: "데스크" },
  { href: "/admin2/articles", label: "기사 데스크" },
  { href: "/admin2/write", label: "작성 스튜디오" },
  { href: "/admin", label: "기존 CMS" },
];

export default function Admin2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);
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

  return (
    <div className={`admin2 admin2-shell ${displayFont.variable}`}>
      <header className="admin2-topbar">
        <div className="admin2-topbar-row">
          <div className="admin2-brand">
            <div className="admin2-brand-mark" />
            <div>
              <div className="admin2-brand-title admin2-display">KJ TIMES CMS</div>
              <div className="admin2-brand-sub">Editorial Command Center</div>
            </div>
          </div>
          <div className="admin2-live">
            <span className="admin2-live-dot" />
            실시간 모니터링 중
          </div>
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
            <label className="admin2-search">
              <span>⌕</span>
              <input placeholder="기사·기자·태그 검색" />
            </label>
            <Link className="admin2-btn admin2-btn-ghost" href="/" target="_blank">
              사이트 보기
            </Link>
            <Link className="admin2-btn admin2-btn-accent" href="/admin2/write">
              속보 작성
            </Link>
          </div>
        </div>
      </header>
      <main className="admin2-body">{children}</main>
    </div>
  );
}
