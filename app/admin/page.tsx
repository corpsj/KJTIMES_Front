"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type RecentArticle = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

const statusTone: Record<string, string> = {
  published: "published",
  shared: "shared",
  pending_review: "pending",
  draft: "draft",
  scheduled: "scheduled",
  rejected: "alert",
  archived: "draft",
};

const statusLabels: Record<string, string> = {
  published: "게시",
  shared: "공유",
  pending_review: "승인 대기",
  draft: "작성",
  scheduled: "예약",
  rejected: "반려",
  archived: "보관",
};

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const [userName, setUserName] = useState("관리자");
  const [loading, setLoading] = useState(true);

  const [statsTotal, setStatsTotal] = useState(0);
  const [statsPublished, setStatsPublished] = useState(0);
  const [statsDraft, setStatsDraft] = useState(0);
  const [statsPending, setStatsPending] = useState(0);

  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // Fetch user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }

      // Fetch stats
      const [totalRes, publishedRes, draftRes, pendingRes] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      ]);
      setStatsTotal(totalRes.count ?? 0);
      setStatsPublished(publishedRes.count ?? 0);
      setStatsDraft(draftRes.count ?? 0);
      setStatsPending(pendingRes.count ?? 0);

      // Fetch recent articles
      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, status, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      setRecentArticles((recent as RecentArticle[]) || []);

      // Today's count vs yesterday
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

      const [todayRes, yesterdayRes] = await Promise.all([
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStart),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", yesterdayStart)
          .lt("created_at", todayStart),
      ]);
      setTodayCount(todayRes.count ?? 0);
      setYesterdayCount(yesterdayRes.count ?? 0);

      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const todayFormatted = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const todayDiff = todayCount - yesterdayCount;
  const diffText =
    todayDiff > 0
      ? `어제보다 ${todayDiff}건 증가`
      : todayDiff < 0
        ? `어제보다 ${Math.abs(todayDiff)}건 감소`
        : "어제와 동일";

  return (
    <div className="admin2-grid admin2-grid--single">
      <div className="admin2-dashboard">
        {/* Welcome Header */}
        <div className="admin2-panel">
          <div className="admin2-dashboard-hero">
            <div className="admin2-dashboard-hero-top">
              <div>
                <div className="admin2-panel-title">대시보드</div>
                <div className="admin2-hero-title admin2-display">
                  환영합니다, {userName}님
                </div>
                <div className="admin2-hero-sub">{todayFormatted}</div>
              </div>
              <div className="admin2-dashboard-actions">
                <Link className="admin2-btn admin2-btn-accent" href="/admin/write">
                  새 기사 작성
                </Link>
                <Link className="admin2-btn admin2-btn-ghost" href="/admin/articles">
                  기사 관리
                </Link>
                <Link className="admin2-btn admin2-btn-ghost" href="/admin/media">
                  미디어
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin2-desk-stats">
          <div className="admin2-desk-stat admin2-desk-stat--ink">
            <div className="admin2-desk-stat-label">전체 기사</div>
            <div className="admin2-desk-stat-value">{loading ? "—" : statsTotal.toLocaleString()}</div>
          </div>
          <div className="admin2-desk-stat admin2-desk-stat--green">
            <div className="admin2-desk-stat-label">게시</div>
            <div className="admin2-desk-stat-value">{loading ? "—" : statsPublished.toLocaleString()}</div>
          </div>
          <div className="admin2-desk-stat admin2-desk-stat--blue">
            <div className="admin2-desk-stat-label">작성</div>
            <div className="admin2-desk-stat-value">{loading ? "—" : statsDraft.toLocaleString()}</div>
          </div>
          <div className="admin2-desk-stat admin2-desk-stat--warning">
            <div className="admin2-desk-stat-label">승인 대기</div>
            <div className="admin2-desk-stat-value">{loading ? "—" : statsPending.toLocaleString()}</div>
          </div>
        </div>

        {/* Today's count comparison */}
        <div className="admin2-panel">
          <div className="admin2-panel-title">오늘의 기사</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>
              {loading ? "—" : `${todayCount}건`}
            </span>
            <span style={{ fontSize: 13, color: "var(--admin2-muted)" }}>
              {loading ? "" : diffText}
            </span>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="admin2-panel">
          <div className="admin2-desk-list-head">
            <div className="admin2-panel-title">최근 기사</div>
            <Link className="admin2-link" href="/admin/articles">
              전체 보기 →
            </Link>
          </div>
          {loading ? (
            <div className="admin2-placeholder">불러오는 중...</div>
          ) : recentArticles.length === 0 ? (
            <div className="admin2-placeholder">기사가 없습니다.</div>
          ) : (
            <div className="admin2-queue">
              {recentArticles.map((article) => (
                <div key={article.id} className="admin2-queue-item">
                  <div>
                    <div className="admin2-queue-title">
                      <Link
                        href={`/admin/write?id=${article.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {article.title}
                      </Link>
                    </div>
                    <div className="admin2-queue-meta">
                      {new Date(article.updated_at || article.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`admin2-tag admin2-tag--${statusTone[article.status] || "draft"}`}
                    >
                      {statusLabels[article.status] || article.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="admin2-dashboard-links">
          <Link href="/admin/write" className="admin2-dashboard-link">
            <span className="admin2-dashboard-link-title">✍️ 새 기사 작성</span>
            <span className="admin2-dashboard-link-meta">작성 스튜디오로 이동</span>
          </Link>
          <Link href="/admin/articles" className="admin2-dashboard-link">
            <span className="admin2-dashboard-link-title">📋 기사 관리</span>
            <span className="admin2-dashboard-link-meta">기사 데스크로 이동</span>
          </Link>
          <Link href="/admin/media" className="admin2-dashboard-link">
            <span className="admin2-dashboard-link-title">🖼️ 미디어</span>
            <span className="admin2-dashboard-link-meta">미디어 라이브러리로 이동</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
