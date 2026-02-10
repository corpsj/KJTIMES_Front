"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconArticle,
  IconEdit,
  IconPhoto,
  IconRss,
  IconMail,
  IconExternalLink,
  IconLogout,
} from "@tabler/icons-react";
import styles from "./AdminSidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "대시보드", icon: <IconLayoutDashboard size={20} /> },
  { href: "/admin/articles", label: "기사 관리", icon: <IconArticle size={20} /> },
  { href: "/admin/write", label: "기사 작성", icon: <IconEdit size={20} /> },
  { href: "/admin/media", label: "미디어", icon: <IconPhoto size={20} /> },
  { href: "/admin/news-feed", label: "뉴스 피드", icon: <IconRss size={20} /> },
  { href: "/admin/mail", label: "제보함", icon: <IconMail size={20} /> },
];

interface AdminSidebarProps {
  userName: string;
  onLogout: () => void;
}

export default function AdminSidebar({ userName, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const userInitial = userName?.[0]?.toUpperCase() || "A";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image
          src="/brand/KJ_sloganLogo.png"
          alt="광전타임즈"
          width={160}
          height={32}
          className={styles.logoImage}
          priority
        />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className={styles.divider} />

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
        >
          <span className={styles.navIcon}>
            <IconExternalLink size={18} />
          </span>
          사이트 보기
        </a>
      </nav>

      <div className={styles.userSection}>
        <div className={styles.avatar}>{userInitial}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>편집 데스크</span>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={onLogout}
          title="로그아웃"
          type="button"
        >
          <IconLogout size={18} />
        </button>
      </div>
    </aside>
  );
}
