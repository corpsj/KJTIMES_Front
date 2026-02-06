"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";
const URGENT_KEYWORDS = ["속보", "단독", "긴급", "특보"];
const STOPWORDS = new Set(["관련", "대한", "위해", "기자", "단독", "속보", "정부", "국회", "오늘", "이번"]);

type ArticleRow = {
  id: string;
  title: string;
  status: string;
  views?: number | null;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  categories?: { name?: string | null; slug?: string | null }[] | { name?: string | null; slug?: string | null } | null;
};

type QueueMetrics = {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  draftArticles: number;
  archivedArticles: number;
  rejectedArticles: number;
  delayedApprovals: number;
  urgentQueueCount: number;
  pendingWebChannel: number;
  pendingShareChannel: number;
  avgPendingHours: number;
  totalViews: number;
  recentArticles: ArticleRow[];
  pendingQueue: ArticleRow[];
  delayedQueue: ArticleRow[];
  urgentQueue: ArticleRow[];
  rejectionPatterns: { keyword: string; count: number }[];
};

const statusLabel: Record<string, string> = {
  published: "게시",
  shared: "공유",
  pending_review: "대기",
  draft: "작성",
  scheduled: "예약",
  rejected: "반려",
  archived: "보관",
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

const getCategoryName = (categories: ArticleRow["categories"]) => {
  if (!categories) return "미분류";
  if (Array.isArray(categories)) {
    return categories[0]?.name || "미분류";
  }
  return categories.name || "미분류";
};

const getCategorySlug = (categories: ArticleRow["categories"]) => {
  if (!categories) return null;
  if (Array.isArray(categories)) {
    return categories[0]?.slug || null;
  }
  return categories.slug || null;
};

const getHoursDiff = (value: string) => {
  return (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60);
};

const tokenizeTitle = (title: string) => {
  return title
    .replace(/[\[\]{}()'"“”‘’,.!?~]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
};

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const [stats, setStats] = useState<QueueMetrics>({
    totalArticles: 0,
    publishedArticles: 0,
    pendingArticles: 0,
    draftArticles: 0,
    archivedArticles: 0,
    rejectedArticles: 0,
    delayedApprovals: 0,
    urgentQueueCount: 0,
    pendingWebChannel: 0,
    pendingShareChannel: 0,
    avgPendingHours: 0,
    totalViews: 0,
    recentArticles: [],
    pendingQueue: [],
    delayedQueue: [],
    urgentQueue: [],
    rejectionPatterns: [],
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, status, views, created_at, updated_at, published_at, categories(name, slug)")
        .order("created_at", { ascending: false });

      if (!articles) return;

      const published = articles.filter((a) => a.status === "published" || a.status === "shared");
      const pending = articles.filter((a) => a.status === "pending_review");
      const draft = articles.filter((a) => a.status === "draft");
      const archived = articles.filter((a) => a.status === "archived");
      const rejected = articles.filter((a) => a.status === "rejected");

      const delayedQueue = pending
        .filter((article) => getHoursDiff(article.created_at) >= 4)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 6);

      const urgentQueue = articles
        .filter((article) => {
          const hasKeyword = URGENT_KEYWORDS.some((keyword) => article.title.includes(keyword));
          const isPendingTooLong = article.status === "pending_review" && getHoursDiff(article.created_at) >= 4;
          return hasKeyword || isPendingTooLong;
        })
        .slice(0, 6);

      const pendingWebChannel = pending.filter(
        (article) => getCategorySlug(article.categories) !== SPECIAL_ISSUE_CATEGORY_SLUG
      ).length;
      const pendingShareChannel = pending.filter(
        (article) => getCategorySlug(article.categories) === SPECIAL_ISSUE_CATEGORY_SLUG
      ).length;

      const avgPendingHours = pending.length
        ? Math.round((pending.reduce((acc, article) => acc + getHoursDiff(article.created_at), 0) / pending.length) * 10) / 10
        : 0;

      const keywordMap = new Map<string, number>();
      rejected.forEach((article) => {
        tokenizeTitle(article.title).forEach((token) => {
          keywordMap.set(token, (keywordMap.get(token) || 0) + 1);
        });
      });

      const rejectionPatterns = [...keywordMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([keyword, count]) => ({ keyword, count }));

      const recent = articles
        .slice()
        .sort((a, b) => {
          const aTime = new Date(a.updated_at || a.created_at).getTime();
          const bTime = new Date(b.updated_at || b.created_at).getTime();
          return bTime - aTime;
        })
        .slice(0, 8);

      setStats({
        totalArticles: articles.length,
        publishedArticles: published.length,
        pendingArticles: pending.length,
        draftArticles: draft.length,
        archivedArticles: archived.length,
        rejectedArticles: rejected.length,
        delayedApprovals: delayedQueue.length,
        urgentQueueCount: urgentQueue.length,
        pendingWebChannel,
        pendingShareChannel,
        avgPendingHours,
        totalViews: articles.reduce((acc, curr) => acc + (curr.views || 0), 0),
        recentArticles: recent,
        pendingQueue: pending.slice(0, 6),
        delayedQueue,
        urgentQueue,
        rejectionPatterns,
      });
    };

    fetchStats();
  }, [supabase]);

  const formattedDate = now.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const queueKpis = useMemo(
    () => [
      {
        label: "승인 지연",
        value: stats.delayedApprovals.toLocaleString(),
        meta: "4시간 이상 대기",
        tone: "warning",
      },
      {
        label: "긴급 큐",
        value: stats.urgentQueueCount.toLocaleString(),
        meta: "속보/지연 감지",
        tone: "blue",
      },
      {
        label: "웹 채널 대기",
        value: stats.pendingWebChannel.toLocaleString(),
        meta: "일반 기사 승인 대기",
        tone: "ink",
      },
      {
        label: "공유 채널 대기",
        value: stats.pendingShareChannel.toLocaleString(),
        meta: "특별호/공유 발행",
        tone: "blue",
      },
      {
        label: "평균 승인 대기",
        value: `${stats.avgPendingHours.toLocaleString()}h`,
        meta: "pending_review 기준",
        tone: "green",
      },
      {
        label: "반려 누적",
        value: stats.rejectedArticles.toLocaleString(),
        meta: "수정 재투입 필요",
        tone: "warning",
      },
    ],
    [stats]
  );

  return (
    <div className="admin2-dashboard">
      <section className="admin2-panel admin2-dashboard-hero">
        <div className="admin2-dashboard-hero-top">
          <div>
            <div className="admin2-panel-title">운영 대시보드</div>
            <div className="admin2-hero-title admin2-display">운영 큐 컨트롤 타워</div>
            <p className="admin2-hero-sub">마지막 집계: {formattedDate}</p>
          </div>
          <div className="admin2-dashboard-actions">
            <Link className="admin2-btn admin2-btn-ink" href="/admin/write">
              기사 작성
            </Link>
            <Link className="admin2-btn admin2-btn-ghost" href="/admin/articles?stage=review&sort=oldest">
              승인 지연 큐 보기
            </Link>
            <Link className="admin2-btn admin2-btn-ghost" href="/admin/articles?status=rejected">
              반려 기사 확인
            </Link>
          </div>
        </div>

        <div className="admin2-dashboard-kpis admin2-dashboard-kpis--queue">
          {queueKpis.map((item) => (
            <div key={`queue-kpi-${item.label}`} className={`admin2-kpi admin2-kpi--${item.tone}`}>
              <div className="admin2-kpi-label">{item.label}</div>
              <div className="admin2-kpi-value">{item.value}</div>
              <div className="admin2-kpi-meta">{item.meta}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="admin2-dashboard-split admin2-dashboard-split--triple">
        <section className="admin2-panel">
          <div className="admin2-panel-title">승인 지연 큐</div>
          <div className="admin2-queue">
            {stats.delayedQueue.length === 0 ? (
              <div className="admin2-placeholder">지연된 승인 요청이 없습니다.</div>
            ) : (
              stats.delayedQueue.map((article) => (
                <div key={article.id} className="admin2-queue-item admin2-dashboard-queue-item">
                  <div>
                    <div className="admin2-queue-title">{article.title}</div>
                    <div className="admin2-queue-meta">
                      {getCategoryName(article.categories)} · 대기 {Math.max(1, Math.round(getHoursDiff(article.created_at)))}h
                    </div>
                    <div className="admin2-dashboard-item-actions">
                      <Link href={`/admin/write?id=${article.id}`}>검수 열기</Link>
                      <Link href="/admin/articles?stage=review&sort=oldest">큐 이동</Link>
                    </div>
                  </div>
                  <span className="admin2-tag admin2-tag--alert">지연</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin2-panel">
          <div className="admin2-panel-title">긴급 기사 큐</div>
          <div className="admin2-queue">
            {stats.urgentQueue.length === 0 ? (
              <div className="admin2-placeholder">긴급 플래그 기사가 없습니다.</div>
            ) : (
              stats.urgentQueue.map((article) => (
                <div key={article.id} className="admin2-queue-item admin2-dashboard-queue-item">
                  <div>
                    <div className="admin2-queue-title">{article.title}</div>
                    <div className="admin2-queue-meta">
                      {getCategoryName(article.categories)} · {new Date(article.created_at).toLocaleString("ko-KR")}
                    </div>
                    <div className="admin2-dashboard-item-actions">
                      <Link href={`/admin/write?id=${article.id}`}>빠른 편집</Link>
                      <Link href="/admin/articles">데스크 이동</Link>
                    </div>
                  </div>
                  <span className="admin2-tag admin2-tag--warning">긴급</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin2-panel">
          <div className="admin2-panel-title">반려 패턴 Top N</div>
          <div className="admin2-insight-list">
            {stats.rejectionPatterns.length === 0 ? (
              <div className="admin2-placeholder">분석할 반려 데이터가 부족합니다.</div>
            ) : (
              stats.rejectionPatterns.map((pattern) => (
                <div key={pattern.keyword} className="admin2-insight-item">
                  <span>#{pattern.keyword}</span>
                  <strong>{pattern.count}건</strong>
                </div>
              ))
            )}
          </div>
          <div className="admin2-highlight">
            채널 대기 현황: 웹 {stats.pendingWebChannel.toLocaleString()}건 · 공유 {stats.pendingShareChannel.toLocaleString()}건
          </div>
        </section>
      </div>

      <section className="admin2-panel">
        <div className="admin2-panel-title">최근 수정 기사</div>
        <div className="admin2-table admin2-table--dashboard">
          {stats.recentArticles.length === 0 ? (
            <div className="admin2-placeholder">최근 수정된 기사가 없습니다.</div>
          ) : (
            stats.recentArticles.map((article) => (
              <div key={article.id} className="admin2-dashboard-row">
                <div>
                  <div className="admin2-row-title">
                    <Link href={`/admin/write?id=${article.id}`}>{article.title}</Link>
                  </div>
                  <div className="admin2-row-meta">
                    {getCategoryName(article.categories)} · {new Date(article.updated_at || article.created_at).toLocaleString("ko-KR")}
                  </div>
                </div>
                <div className="admin2-dashboard-row-side">
                  <span className={`admin2-tag admin2-tag--${statusTone[article.status] || "draft"}`}>
                    {statusLabel[article.status] || article.status}
                  </span>
                  <span className="admin2-row-meta">조회 {article.views?.toLocaleString() || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="admin2-panel">
        <div className="admin2-panel-title">바로 가기</div>
        <div className="admin2-dashboard-links">
          <Link className="admin2-dashboard-link" href="/admin/articles?status=draft">
            <span className="admin2-dashboard-link-title">작성 중 기사</span>
            <span className="admin2-dashboard-link-meta">{stats.draftArticles.toLocaleString()}건</span>
          </Link>
          <Link className="admin2-dashboard-link" href="/admin/articles?stage=review&sort=oldest">
            <span className="admin2-dashboard-link-title">승인 대기 큐</span>
            <span className="admin2-dashboard-link-meta">{stats.pendingArticles.toLocaleString()}건</span>
          </Link>
          <Link className="admin2-dashboard-link" href="/admin/articles?stage=publish">
            <span className="admin2-dashboard-link-title">발행 완료</span>
            <span className="admin2-dashboard-link-meta">{stats.publishedArticles.toLocaleString()}건</span>
          </Link>
          <Link className="admin2-dashboard-link" href="/admin/articles?status=archived">
            <span className="admin2-dashboard-link-title">보관 기사</span>
            <span className="admin2-dashboard-link-meta">{stats.archivedArticles.toLocaleString()}건</span>
          </Link>
          <Link className="admin2-dashboard-link" href="/admin/articles?status=rejected">
            <span className="admin2-dashboard-link-title">반려 기사</span>
            <span className="admin2-dashboard-link-meta">{stats.rejectedArticles.toLocaleString()}건</span>
          </Link>
          <Link className="admin2-dashboard-link" href="/admin/articles?sort=views_desc">
            <span className="admin2-dashboard-link-title">조회수 상위</span>
            <span className="admin2-dashboard-link-meta">누적 {stats.totalViews.toLocaleString()}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
