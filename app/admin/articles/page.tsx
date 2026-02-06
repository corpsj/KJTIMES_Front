"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";

type ArticleRow = {
  id: string;
  title: string;
  slug?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  views?: number | null;
  categories?: { name?: string | null; slug?: string | null }[] | { name?: string | null; slug?: string | null } | null;
};

type StatusUpdatePayload = {
  status: string;
  updated_at: string;
  published_at?: string | null;
};

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "published", label: "게시" },
  { value: "shared", label: "공유" },
  { value: "pending_review", label: "승인 대기" },
  { value: "draft", label: "작성" },
  { value: "scheduled", label: "예약" },
  { value: "rejected", label: "반려" },
  { value: "archived", label: "보관" },
] as const;

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
] as const;

const bulkStatusOptions = [
  { value: "pending_review", label: "승인 대기" },
  { value: "published", label: "게시" },
  { value: "shared", label: "공유" },
  { value: "draft", label: "작성" },
  { value: "archived", label: "보관" },
] as const;

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

const validStatusValues = new Set(statusOptions.map((option) => option.value));
const validSortValues = new Set(sortOptions.map((option) => option.value));

export default function AdminArticles() {
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("latest");
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [bulkStatusTarget, setBulkStatusTarget] = useState("pending_review");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const searchTermRef = useRef("");

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

  const isSpecialIssueArticle = (article: ArticleRow) =>
    getCategorySlug(article.categories) === SPECIAL_ISSUE_CATEGORY_SLUG;

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const statusParam = params.get("status");
    const sortParam = params.get("sort");
    const qParam = params.get("q");

    const nextStatus =
      statusParam && validStatusValues.has(statusParam as (typeof statusOptions)[number]["value"])
        ? statusParam
        : "all";
    const nextSort =
      sortParam && validSortValues.has(sortParam as (typeof sortOptions)[number]["value"])
        ? sortParam
        : "latest";
    const nextSearch = qParam || "";

    setStatusFilter(nextStatus);
    setSortFilter(nextSort);
    setSearchTerm(nextSearch);
    searchTermRef.current = nextSearch;
    setRefreshToken((prev) => prev + 1);
  }, [searchParamsKey]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      let query = supabase
        .from("articles")
        .select("id, title, slug, status, created_at, updated_at, published_at, views, categories(name, slug)");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const term = searchTermRef.current.trim().replace(/[%]/g, "");
      if (term) {
        query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);
      }

      switch (sortFilter) {
        case "oldest":
          query = query.order("updated_at", { ascending: true });
          break;
        case "latest":
        default:
          query = query.order("updated_at", { ascending: false });
          break;
      }

      const { data } = await query;
      const fetched = data || [];
      const visibleIdSet = new Set(fetched.map((article) => article.id));

      setArticles(fetched);
      setSelectedArticleIds((current) => current.filter((id) => visibleIdSet.has(id)));
      setLoading(false);
    };

    fetchArticles();
  }, [statusFilter, sortFilter, supabase, refreshToken]);

  const triggerRefresh = () => {
    setRefreshToken((prev) => prev + 1);
  };

  const copyToClipboard = async (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    if (typeof document === "undefined") {
      throw new Error("Clipboard unavailable");
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("Copy command failed");
    }
  };

  const copySpecialIssueShareLink = async (article: ArticleRow) => {
    if (!article.slug) {
      alert("공유 링크를 생성할 수 없습니다.");
      return;
    }

    const isShareVisible = article.status === "shared" || article.status === "published";
    if (!isShareVisible) {
      alert("공유/게시 상태에서만 링크를 복사할 수 있습니다.");
      return;
    }

    const shareUrl = `${window.location.origin}/share/${article.slug}`;

    try {
      await copyToClipboard(shareUrl);
      alert("공유 링크를 복사했습니다.");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const resolveStatusPayload = (article: ArticleRow, status: string): StatusUpdatePayload => {
    const normalizedStatus =
      isSpecialIssueArticle(article) && status !== "draft" && status !== "archived" && status !== "rejected"
        ? "shared"
        : status;

    const payload: StatusUpdatePayload = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if (normalizedStatus === "published" || normalizedStatus === "shared") {
      payload.published_at = article.published_at || new Date().toISOString();
    } else if (normalizedStatus !== "scheduled") {
      payload.published_at = null;
    }

    return payload;
  };

  const updateStatus = async (article: ArticleRow, status: string) => {
    setActionLoadingId(article.id);
    const payload = resolveStatusPayload(article, status);

    const { error } = await supabase.from("articles").update(payload).eq("id", article.id);

    if (error) {
      alert(`상태 변경 실패: ${error.message}`);
    } else {
      triggerRefresh();
    }

    setActionLoadingId(null);
  };

  const handleShareAction = async (article: ArticleRow) => {
    const canOpenShareLink = Boolean(article.slug && (article.status === "shared" || article.status === "published"));
    if (!canOpenShareLink || !article.slug) return;

    if (isSpecialIssueArticle(article)) {
      await copySpecialIssueShareLink(article);
      return;
    }

    window.open(`/share/${article.slug}`, "_blank", "noopener,noreferrer");
  };

  const applyBulkStatus = async () => {
    if (selectedArticleIds.length === 0) {
      alert("먼저 기사 항목을 선택해주세요.");
      return;
    }

    setBulkLoading(true);
    try {
      const selectedArticles = articles.filter((article) => selectedArticleIds.includes(article.id));
      const results = await Promise.all(
        selectedArticles.map((article) => {
          const payload = resolveStatusPayload(article, bulkStatusTarget);
          return supabase.from("articles").update(payload).eq("id", article.id);
        })
      );

      const failed = results.find((result) => result.error);
      if (failed?.error) {
        alert(`일괄 상태 변경 실패: ${failed.error.message}`);
        return;
      }

      setSelectedArticleIds([]);
      triggerRefresh();
    } finally {
      setBulkLoading(false);
    }
  };

  const deleteArticle = async (article: ArticleRow) => {
    const confirmed = window.confirm(`"${article.title}" 기사를 삭제할까요?`);
    if (!confirmed) return;

    setActionLoadingId(article.id);
    const { count, error } = await supabase.from("articles").delete({ count: "exact" }).eq("id", article.id);

    if (error) {
      alert(`삭제 실패: ${error.message}`);
    } else if (!count) {
      alert("삭제된 기사가 없습니다.");
    } else {
      triggerRefresh();
    }

    setActionLoadingId(null);
  };

  const deleteSelectedArticles = async () => {
    if (selectedArticleIds.length === 0) {
      alert("삭제할 기사 항목을 선택해주세요.");
      return;
    }

    const confirmed = window.confirm(`선택한 ${selectedArticleIds.length}건을 삭제할까요?`);
    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const { count, error } = await supabase
        .from("articles")
        .delete({ count: "exact" })
        .in("id", selectedArticleIds);

      if (error) {
        alert(`일괄 삭제 실패: ${error.message}`);
        return;
      }

      if (!count) {
        alert("삭제된 기사가 없습니다.");
        return;
      }

      setSelectedArticleIds([]);
      triggerRefresh();
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleArticleSelection = (articleId: string, checked: boolean) => {
    setSelectedArticleIds((current) => {
      if (checked) {
        return current.includes(articleId) ? current : [...current, articleId];
      }
      return current.filter((id) => id !== articleId);
    });
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      setSelectedArticleIds(articles.map((article) => article.id));
      return;
    }
    setSelectedArticleIds([]);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSortFilter("latest");
    setSearchTerm("");
    searchTermRef.current = "";
    setSelectedArticleIds([]);
    triggerRefresh();
  };

  const selectedCount = selectedArticleIds.length;
  const allVisibleSelected = articles.length > 0 && selectedCount === articles.length;
  const hasActiveFilters =
    statusFilter !== "all" || sortFilter !== "latest" || searchTerm.trim().length > 0;

  return (
    <div className="admin2-grid admin2-grid--single">
      <div>
        <div className="admin2-panel admin2-desk-board">
          <div className="admin2-desk-head">
            <div>
              <div className="admin2-panel-title">기사 데스크</div>
              <div className="admin2-hero-title admin2-display">기사 관리</div>
            </div>
            <div className="admin2-desk-head-actions">
              <Link className="admin2-btn admin2-btn-accent" href="/admin/write">
                새 기사 작성
              </Link>
            </div>
          </div>

          <div className="admin2-desk-controls">
            <label className="admin2-search admin2-desk-search">
              <span>⌕</span>
              <input
                placeholder="제목 또는 슬러그 검색"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  searchTermRef.current = event.target.value;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") triggerRefresh();
                }}
              />
            </label>

            <label className="admin2-desk-select">
              <span>상태</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="상태 필터">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin2-desk-select">
              <span>정렬</span>
              <select value={sortFilter} onChange={(event) => setSortFilter(event.target.value)} aria-label="정렬">
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {hasActiveFilters && (
              <button className="admin2-btn admin2-btn-ghost" type="button" onClick={resetFilters} disabled={bulkLoading}>
                초기화
              </button>
            )}
          </div>
        </div>

        <div className="admin2-panel admin2-desk-list-panel">
          <div className="admin2-desk-list-head">
            <div className="admin2-panel-title">목록</div>
            <div className="admin2-desk-list-tools">
              <label className="admin2-row-check admin2-row-check--master">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) => toggleSelectAllVisible(event.target.checked)}
                  disabled={loading || articles.length === 0}
                />
                전체 선택
              </label>
              <div className="admin2-badge">총 {articles.length.toLocaleString()}건</div>
            </div>
          </div>

          <div className="admin2-desk-bulk">
            <div className="admin2-row-meta">선택 {selectedCount.toLocaleString()}건</div>
            <label className="admin2-desk-select admin2-desk-select--inline">
              <span>상태 변경</span>
              <select
                value={bulkStatusTarget}
                onChange={(event) => setBulkStatusTarget(event.target.value)}
                disabled={selectedCount === 0 || bulkLoading}
              >
                {bulkStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="admin2-btn admin2-btn-ghost"
              type="button"
              onClick={applyBulkStatus}
              disabled={selectedCount === 0 || bulkLoading}
            >
              적용
            </button>
            <button
              className="admin2-btn admin2-row-action--danger"
              type="button"
              onClick={deleteSelectedArticles}
              disabled={selectedCount === 0 || bulkLoading}
            >
              삭제
            </button>
          </div>

          <div className="admin2-desk-table-wrap">
            <table className="admin2-desk-table">
              <thead>
                <tr>
                  <th>선택</th>
                  <th>제목</th>
                  <th>상태</th>
                  <th>카테고리</th>
                  <th>수정일</th>
                  <th>조회수</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin2-placeholder">불러오는 중...</div>
                    </td>
                  </tr>
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin2-placeholder">기사가 없습니다.</div>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => {
                    const isSelected = selectedArticleIds.includes(article.id);
                    const isSpecialIssue = isSpecialIssueArticle(article);
                    const canOpenShareLink = Boolean(article.slug && (article.status === "shared" || article.status === "published"));

                    return (
                      <tr key={article.id} className={actionLoadingId === article.id ? "is-loading" : undefined}>
                        <td>
                          <label className="admin2-row-check">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) => toggleArticleSelection(article.id, event.target.checked)}
                            />
                          </label>
                        </td>
                        <td>
                          <div className="admin2-table-title-wrap">
                            <div className="admin2-table-title-line">
                              <Link href={`/admin/write?id=${article.id}`}>{article.title}</Link>
                            </div>
                            {isSpecialIssue && <div className="admin2-row-meta admin2-row-meta--special">창간특별호</div>}
                          </div>
                        </td>
                        <td>
                          <span className={`admin2-tag admin2-tag--${isSpecialIssue && article.status === "shared" ? "special" : statusTone[article.status] || "draft"}`}>
                            {statusLabels[article.status] || article.status}
                          </span>
                        </td>
                        <td>{getCategoryName(article.categories)}</td>
                        <td>{new Date(article.updated_at || article.created_at).toLocaleString("ko-KR")}</td>
                        <td>{article.views?.toLocaleString() || 0}</td>
                        <td>
                          <div className="admin2-table-actions">
                            <Link href={`/admin/write?id=${article.id}`}>편집</Link>
                            {canOpenShareLink && article.slug ? (
                              <button
                                type="button"
                                onClick={() => void handleShareAction(article)}
                                disabled={actionLoadingId === article.id || bulkLoading}
                              >
                                공유
                              </button>
                            ) : null}
                            <div className="admin2-inline-status">
                              <select
                                value={article.status}
                                onChange={(event) => void updateStatus(article, event.target.value)}
                                disabled={actionLoadingId === article.id || bulkLoading}
                              >
                                {statusOptions
                                  .filter((option) => option.value !== "all")
                                  .map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              className="admin2-row-action--danger"
                              onClick={() => deleteArticle(article)}
                              disabled={actionLoadingId === article.id || bulkLoading}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
