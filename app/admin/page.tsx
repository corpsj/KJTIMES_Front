"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type ArticleRow = {
  id: string;
  title: string;
  status: string;
  views?: number | null;
  created_at: string;
  categories?: { name?: string | null }[] | null;
};

type StatsState = {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  draftArticles: number;
  totalViews: number;
  recentArticles: ArticleRow[];
};

const scheduleItems = [
  {
    time: "08:30",
    title: "편집회의: 1면 헤드라인 확정",
    owner: "편집국",
  },
  {
    time: "11:00",
    title: "속보 큐 브리핑",
    owner: "정치팀",
  },
  {
    time: "14:30",
    title: "오늘의 데이터 스토리 검토",
    owner: "데이터팀",
  },
  {
    time: "18:00",
    title: "저녁 메인 큐레이션",
    owner: "디지털데스크",
  },
];

const deskAlerts = [
  "속보 우선순위 기준: 지역 긴급·안전 관련 이슈 우선 처리",
  "사진 캡션/크레딧 누락 여부 반드시 확인",
  "SEO 메타·기사 태그 미기입 건 자동 발행 불가",
];

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const [stats, setStats] = useState<StatsState>({
    totalArticles: 0,
    publishedArticles: 0,
    pendingArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    recentArticles: [],
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
        .select("id, title, status, views, created_at, categories(name)")
        .order("created_at", { ascending: false });

      if (articles) {
        const total = articles.length;
        const published = articles.filter((a) => a.status === "published" || a.status === "shared").length;
        const pending = articles.filter((a) => a.status === "pending_review").length;
        const draft = articles.filter((a) => a.status === "draft").length;
        const views = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const recent = articles.slice(0, 6);

        setStats({
          totalArticles: total,
          publishedArticles: published,
          pendingArticles: pending,
          draftArticles: draft,
          totalViews: views,
          recentArticles: recent,
        });
      }
    };

    fetchStats();
  }, [supabase]);

  const publishRate = stats.totalArticles
    ? Math.round((stats.publishedArticles / stats.totalArticles) * 100)
    : 0;

  const formattedDate = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const formattedTime = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const kpis = useMemo(
    () => [
      {
        label: "총 조회수",
        value: stats.totalViews.toLocaleString(),
        meta: "최근 30일 누적",
      },
      {
        label: "발행률",
        value: `${publishRate}%`,
        meta: `${stats.publishedArticles}/${stats.totalArticles}`,
      },
      {
        label: "승인 대기",
        value: stats.pendingArticles.toString(),
        meta: "데스크 확인 필요",
      },
      {
        label: "작성 중",
        value: stats.draftArticles.toString(),
        meta: "기자 편집 진행",
      },
    ],
    [publishRate, stats]
  );

  const miniKpis = [
    {
      label: "발행 완료",
      value: stats.publishedArticles.toString(),
      meta: "오늘 기준",
    },
    {
      label: "승인 대기",
      value: stats.pendingArticles.toString(),
      meta: "데스크 확인",
    },
  ];

  const workflow = [
    { label: "작성 중", count: stats.draftArticles, tone: "draft" },
    { label: "승인 대기", count: stats.pendingArticles, tone: "pending" },
    { label: "게시 완료", count: stats.publishedArticles, tone: "published" },
  ];

  return (
    <div className="admin2-grid">
      <aside>
        <div className="admin2-panel">
          <div className="admin2-panel-title">오늘의 데스크</div>
          <div className="admin2-hero-title admin2-display">운영 요약</div>
          <p className="admin2-hero-sub">{formattedDate} · {formattedTime}</p>
          <div className="admin2-kpi-grid">
            {miniKpis.map((item) => (
              <div key={item.label} className="admin2-kpi">
                <div className="admin2-kpi-label">{item.label}</div>
                <div className="admin2-kpi-value">{item.value}</div>
                <div className="admin2-kpi-meta">{item.meta}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin2-panel">
          <div className="admin2-panel-title">워크플로우</div>
          <div className="admin2-queue">
            {workflow.map((item) => (
              <div key={item.label} className="admin2-queue-item">
                <div>
                  <div className="admin2-queue-title">{item.label}</div>
                  <div className="admin2-queue-meta">현재 진행 건수</div>
                </div>
                <span className={`admin2-tag admin2-tag--${item.tone}`}>
                  {item.count}건
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin2-panel">
          <div className="admin2-panel-title">빠른 액션</div>
          <div className="admin2-queue">
            <Link className="admin2-btn admin2-btn-ink" href="/admin/write">
              긴급 기사 작성
            </Link>
            <Link className="admin2-btn admin2-btn-ghost" href="/admin/articles">
              승인 대기 큐 확인
            </Link>
            <Link className="admin2-btn admin2-btn-ghost" href="/admin/media">
              미디어 라이브러리
            </Link>
          </div>
        </div>
      </aside>

      <section>
        <div className="admin2-hero">
          <div className="admin2-panel">
            <div className="admin2-panel-title">뉴스룸 컨트롤</div>
            <div className="admin2-hero-title admin2-display">편집국 운영 현황</div>
            <p className="admin2-hero-sub">
              발행 흐름과 데스크 상태를 한눈에 확인하고, 우선순위를 조정하세요.
            </p>
            <div className="admin2-kpi-grid">
              {kpis.map((item) => (
                <div key={`center-${item.label}`} className="admin2-kpi">
                  <div className="admin2-kpi-label">{item.label}</div>
                  <div className="admin2-kpi-value">{item.value}</div>
                  <div className="admin2-kpi-meta">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="admin2-panel">
            <div className="admin2-panel-title">발행 대기 큐</div>
            <div className="admin2-queue">
              {stats.recentArticles.length === 0 ? (
                <div className="admin2-placeholder">발행 대기 기사가 없습니다.</div>
              ) : (
                stats.recentArticles.slice(0, 3).map((article) => (
                  <div key={article.id} className="admin2-queue-item">
                    <div>
                      <div className="admin2-queue-title">{article.title}</div>
                      <div className="admin2-queue-meta">
                        {article.categories?.[0]?.name || "미분류"} · {new Date(article.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="admin2-tag admin2-tag--pending">대기</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="admin2-panel">
          <div className="admin2-panel-title">최근 기사</div>
          <div className="admin2-table">
            {stats.recentArticles.length === 0 ? (
              <div className="admin2-placeholder">최근 작성된 기사가 없습니다.</div>
            ) : (
              stats.recentArticles.map((article) => (
                <div key={article.id} className="admin2-row">
                  <div>
                    <div className="admin2-row-title">{article.title}</div>
                    <div className="admin2-row-meta">
                      {article.categories?.[0]?.name || "미분류"} · {new Date(article.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                  <div className="admin2-status-column">
                    <span className={`admin2-tag admin2-tag--${article.status === "published" ? "published" : article.status === "shared" ? "shared" : article.status === "pending_review" ? "pending" : "draft"}`}>
                      {article.status === "published" ? "게시" : article.status === "shared" ? "공유" : article.status === "pending_review" ? "대기" : "작성"}
                    </span>
                  </div>
                  <div className="admin2-row-meta">조회 {article.views?.toLocaleString() || 0}</div>
                  <div className="admin2-row-actions">
                    <Link href={`/admin/write?id=${article.id}`}>편집</Link>
                    <Link href={`/admin/write?id=${article.id}`}>미리보기</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <aside className="admin2-right-panel">
        <div className="admin2-panel">
          <div className="admin2-panel-title">오늘의 캘린더</div>
          <div className="admin2-schedule">
            {scheduleItems.map((item) => (
              <div key={item.time} className="admin2-schedule-item">
                <div className="admin2-schedule-time">{item.time}</div>
                <div>
                  <div className="admin2-queue-title">{item.title}</div>
                  <div className="admin2-schedule-meta">{item.owner}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin2-panel">
          <div className="admin2-panel-title">실시간 성과</div>
          <div className="admin2-highlight">
            현재 메인 페이지 평균 체류시간이 전일 대비 12% 증가했습니다.
          </div>
          <div className="admin2-queue" style={{ marginTop: "12px" }}>
            <div className="admin2-badge">실시간 트래픽 안정</div>
            <div className="admin2-badge">모바일 유입 비중 63%</div>
          </div>
        </div>

        <div className="admin2-panel">
          <div className="admin2-panel-title">데스크 알림</div>
          <div className="admin2-queue">
            {deskAlerts.map((alert) => (
              <div key={alert} className="admin2-queue-item">
                <div className="admin2-queue-title">{alert}</div>
                <span className="admin2-tag admin2-tag--alert">필수</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
