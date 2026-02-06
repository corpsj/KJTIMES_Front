"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type ArticleRow = {
  id: string;
  title: string;
  slug?: string | null;
  status: string;
  created_at: string;
  published_at?: string | null;
  views?: number | null;
  categories?: { name?: string | null }[] | { name?: string | null } | null;
};

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "published", label: "게시됨" },
  { value: "shared", label: "공유용" },
  { value: "pending_review", label: "승인 대기" },
  { value: "draft", label: "임시저장" },
  { value: "scheduled", label: "예약됨" },
  { value: "rejected", label: "반려됨" },
  { value: "archived", label: "보관됨" },
];

const statusLabels: Record<string, string> = {
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

export default function AdminArticles() {
  const [supabase] = useState(() => createClient());
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const searchTermRef = useRef("");

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      let query = supabase
        .from("articles")
        .select("id, title, slug, status, created_at, published_at, views, categories(name)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const term = searchTermRef.current.trim();
      if (term) {
        query = query.ilike("title", `%${term}%`);
      }

      const { data } = await query;
      setArticles(data || []);
      setLoading(false);
    };

    fetchArticles();
  }, [statusFilter, supabase, refreshToken]);

  const triggerRefresh = () => {
    setRefreshToken((prev) => prev + 1);
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      triggerRefresh();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchTermRef.current = value;
  };

  const getCategoryName = (categories: ArticleRow["categories"]) => {
    if (!categories) return "미분류";
    if (Array.isArray(categories)) {
      return categories[0]?.name || "미분류";
    }
    return categories.name || "미분류";
  };

  type StatusUpdatePayload = {
    status: string;
    updated_at: string;
    published_at?: string | null;
  };

  const updateStatus = async (article: ArticleRow, status: string) => {
    setActionLoadingId(article.id);
    const payload: StatusUpdatePayload = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "published" || status === "shared") {
      payload.published_at = article.published_at || new Date().toISOString();
    } else if (status !== "scheduled") {
      payload.published_at = null;
    }

    const { error } = await supabase
      .from("articles")
      .update(payload)
      .eq("id", article.id);

    if (error) {
      alert(`상태 변경 실패: ${error.message}`);
    } else {
      triggerRefresh();
    }
    setActionLoadingId(null);
  };

  const deleteArticle = async (article: ArticleRow) => {
    const confirmed = window.confirm(`"${article.title}" 기사를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;

    setActionLoadingId(article.id);
    const { error } = await supabase.from("articles").delete().eq("id", article.id);
    if (error) {
      alert(`삭제 실패: ${error.message}`);
    } else {
      triggerRefresh();
    }
    setActionLoadingId(null);
  };

  return (
    <div className="admin2-grid admin2-grid--single">
      <div>
        <div className="admin2-panel">
          <div className="admin2-panel-title">기사 데스크</div>
          <div className="admin2-hero-title admin2-display">기사 관리 보드</div>
          <p className="admin2-hero-sub">작성·승인·발행 흐름을 한 화면에서 관리하세요.</p>
          <div className="admin2-filter-bar" style={{ marginTop: "16px" }}>
            <label className="admin2-search" style={{ minWidth: "280px" }}>
              <span>⌕</span>
              <input
                placeholder="기사 제목 또는 키워드 검색"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                onKeyDown={handleSearch}
              />
            </label>
            <button className="admin2-btn admin2-btn-ghost" onClick={triggerRefresh}>
              검색
            </button>
            <Link className="admin2-btn admin2-btn-accent" href="/admin/write">
              새 기사 작성
            </Link>
          </div>
          <div className="admin2-filter-bar" style={{ marginTop: "12px" }}>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`admin2-chip ${statusFilter === option.value ? "active" : ""}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin2-panel" style={{ marginTop: "18px" }}>
          <div className="admin2-panel-title">기사 목록</div>
          <div className="admin2-table">
            {loading ? (
              <div className="admin2-placeholder">데이터를 불러오는 중입니다.</div>
            ) : articles.length === 0 ? (
              <div className="admin2-placeholder">조건에 맞는 기사가 없습니다.</div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="admin2-row">
                  <div>
                    <div className="admin2-row-title">
                      <Link href={`/admin/write?id=${article.id}`}>{article.title}</Link>
                    </div>
                    <div className="admin2-row-meta">
                      {getCategoryName(article.categories)} · {new Date(article.published_at || article.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                  <div className="admin2-status-column">
                    <span className={`admin2-tag admin2-tag--${statusTone[article.status] || "draft"}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                  </div>
                  <div className="admin2-row-meta">조회 {article.views?.toLocaleString() || 0}</div>
                  <div className="admin2-row-actions">
                    <Link href={`/admin/write?id=${article.id}`}>편집</Link>
                    {article.slug && (article.status === "shared" || article.status === "published") ? (
                      <Link href={`/share/${article.slug}`} target="_blank">공유 보기</Link>
                    ) : (
                      <span className="admin2-row-meta">공유 발행 필요</span>
                    )}
                    {article.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(article, "pending_review")}
                        disabled={actionLoadingId === article.id}
                      >
                        승인 요청
                      </button>
                    )}
                    {article.status === "pending_review" && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(article, "published")}
                          disabled={actionLoadingId === article.id}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className="admin2-row-action--danger"
                          onClick={() => updateStatus(article, "rejected")}
                          disabled={actionLoadingId === article.id}
                        >
                          반려
                        </button>
                      </>
                    )}
                    {(article.status === "draft" || article.status === "pending_review" || article.status === "rejected") && (
                      article.slug ? (
                        <button
                          type="button"
                          onClick={() => updateStatus(article, "shared")}
                          disabled={actionLoadingId === article.id}
                        >
                          공유 발행
                        </button>
                      ) : null
                    )}
                    {(article.status === "published" || article.status === "shared") && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(article, "draft")}
                          disabled={actionLoadingId === article.id}
                        >
                          내리기
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(article, "archived")}
                          disabled={actionLoadingId === article.id}
                        >
                          보관
                        </button>
                      </>
                    )}
                    {article.status === "archived" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(article, "draft")}
                        disabled={actionLoadingId === article.id}
                      >
                        복구
                      </button>
                    )}
                    {article.status === "rejected" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(article, "draft")}
                        disabled={actionLoadingId === article.id}
                      >
                        재작성
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin2-row-action--danger"
                      onClick={() => deleteArticle(article)}
                      disabled={actionLoadingId === article.id}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
