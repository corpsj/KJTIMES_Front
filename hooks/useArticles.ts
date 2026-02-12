"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { createClient } from "@/utils/supabase/client";

/* ──────────────────────────── Types ──────────────────────────── */

export type ArticleRow = {
  id: string;
  title: string;
  slug?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  views?: number | null;
  categories?:
    | { name?: string | null; slug?: string | null }[]
    | { name?: string | null; slug?: string | null }
    | null;
};

type StatusUpdatePayload = {
  status: string;
  updated_at: string;
  published_at?: string | null;
};

/* ──────────────────────────── Constants ──────────────────────── */

const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";
export const PAGE_SIZE = 20;

export const statusOptions = [
  { value: "all", label: "전체" },
  { value: "published", label: "게시" },
  { value: "shared", label: "공유" },
  { value: "pending_review", label: "승인 대기" },
  { value: "draft", label: "작성" },
  { value: "scheduled", label: "예약" },
  { value: "rejected", label: "반려" },
  { value: "archived", label: "보관" },
] as const;

export const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
] as const;

export const bulkStatusOptions = [
  { value: "pending_review", label: "승인 대기" },
  { value: "published", label: "게시" },
  { value: "shared", label: "공유" },
  { value: "draft", label: "작성" },
  { value: "archived", label: "보관" },
] as const;

export const inlineStatusOptions = statusOptions.filter(
  (o) => o.value !== "all"
);

const validStatusValues = new Set(statusOptions.map((o) => o.value));
const validSortValues = new Set(sortOptions.map((o) => o.value));

/* ──────────────────────────── Helpers ──────────────────────────── */

export const getCategoryName = (categories: ArticleRow["categories"]) => {
  if (!categories) return "미분류";
  if (Array.isArray(categories)) return categories[0]?.name || "미분류";
  return categories.name || "미분류";
};

export const getCategorySlug = (categories: ArticleRow["categories"]) => {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0]?.slug || null;
  return categories.slug || null;
};

export const isSpecialIssueArticle = (article: ArticleRow) =>
  getCategorySlug(article.categories) === SPECIAL_ISSUE_CATEGORY_SLUG;

/* ══════════════════════════════════════════════════════════════ */
/*  Hook                                                         */
/* ══════════════════════════════════════════════════════════════ */

export function useArticles() {
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const [deleteModalArticle, setDeleteModalArticle] =
    useState<ArticleRow | null>(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statsTotal, setStatsTotal] = useState(0);
  const [statsPublished, setStatsPublished] = useState(0);
  const [statsDraft, setStatsDraft] = useState(0);
  const [statsPending, setStatsPending] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      const [totalRes, publishedRes, draftRes, pendingRes] =
        await Promise.all([
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("status", "draft"),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending_review"),
        ]);
      setStatsTotal(totalRes.count ?? 0);
      setStatsPublished(publishedRes.count ?? 0);
      setStatsDraft(draftRes.count ?? 0);
      setStatsPending(pendingRes.count ?? 0);
    };
    fetchStats();
  }, [supabase, refreshToken]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const statusParam = params.get("status");
    const sortParam = params.get("sort");
    const qParam = params.get("q");

    const nextStatus =
      statusParam &&
      validStatusValues.has(
        statusParam as (typeof statusOptions)[number]["value"]
      )
        ? statusParam
        : "all";
    const nextSort =
      sortParam &&
      validSortValues.has(
        sortParam as (typeof sortOptions)[number]["value"]
      )
        ? sortParam
        : "latest";
    const nextSearch = qParam || "";

    setStatusFilter(nextStatus);
    setSortFilter(nextSort);
    setSearchTerm(nextSearch);
    searchTermRef.current = nextSearch;
    setPage(1);
    setRefreshToken((prev) => prev + 1);
  }, [searchParamsKey]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);

      let countQuery = supabase
        .from("articles")
        .select("id", { count: "exact", head: true });
      if (statusFilter !== "all")
        countQuery = countQuery.eq("status", statusFilter);
      const term = searchTermRef.current.trim().replace(/[%]/g, "");
      if (term)
        countQuery = countQuery.or(
          `title.ilike.%${term}%,slug.ilike.%${term}%`
        );

      const { count } = await countQuery;
      const total = count ?? 0;
      setTotalCount(total);

      const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const safePage = Math.min(page, maxPage);
      if (safePage !== page) setPage(safePage);

      const from = (safePage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("articles")
        .select(
          "id, title, slug, status, created_at, updated_at, published_at, views, categories(name, slug)"
        );

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (term)
        query = query.or(
          `title.ilike.%${term}%,slug.ilike.%${term}%`
        );

      switch (sortFilter) {
        case "oldest":
          query = query.order("updated_at", { ascending: true });
          break;
        default:
          query = query.order("updated_at", { ascending: false });
          break;
      }

      query = query.range(from, to);
      const { data } = await query;
      const fetched = data || [];
      const visibleIdSet = new Set(fetched.map((a) => a.id));

      setArticles(fetched);
      setSelectedArticleIds((cur) =>
        cur.filter((id) => visibleIdSet.has(id))
      );
      setLoading(false);
    };

    fetchArticles();
  }, [statusFilter, sortFilter, supabase, refreshToken, page]);

  const triggerRefresh = () => setRefreshToken((p) => p + 1);

  /* ──── Clipboard ──── */

  const copyToClipboard = async (value: string) => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard.writeText(value);
      return;
    }
    if (typeof document === "undefined")
      throw new Error("Clipboard unavailable");
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) throw new Error("Copy command failed");
  };

  const copySpecialIssueShareLink = async (article: ArticleRow) => {
    if (!article.slug) {
      notifications.show({
        title: "오류",
        message: "공유 링크를 생성할 수 없습니다.",
        color: "red",
      });
      return;
    }
    const isShareVisible =
      article.status === "shared" || article.status === "published";
    if (!isShareVisible) {
      notifications.show({
        title: "안내",
        message: "공유/게시 상태에서만 링크를 복사할 수 있습니다.",
        color: "yellow",
      });
      return;
    }
    const shareUrl = `${window.location.origin}/share/${article.slug}`;
    try {
      await copyToClipboard(shareUrl);
      notifications.show({
        title: "성공",
        message: "공유 링크를 복사했습니다.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "오류",
        message: "링크 복사에 실패했습니다.",
        color: "red",
      });
    }
  };

  /* ──── Status helpers ──── */

  const resolveStatusPayload = (
    article: ArticleRow,
    status: string
  ): StatusUpdatePayload => {
    const normalizedStatus =
      isSpecialIssueArticle(article) &&
      status !== "draft" &&
      status !== "archived" &&
      status !== "rejected"
        ? "shared"
        : status;

    const payload: StatusUpdatePayload = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if (
      normalizedStatus === "published" ||
      normalizedStatus === "shared"
    ) {
      payload.published_at =
        article.published_at || new Date().toISOString();
    } else if (normalizedStatus !== "scheduled") {
      payload.published_at = null;
    }

    return payload;
  };

  const updateStatus = async (article: ArticleRow, status: string) => {
    setActionLoadingId(article.id);
    const payload = resolveStatusPayload(article, status);
    const { error } = await supabase
      .from("articles")
      .update(payload)
      .eq("id", article.id);
    if (error)
      notifications.show({
        title: "오류",
        message: `상태 변경 실패: ${error.message}`,
        color: "red",
      });
    else triggerRefresh();
    setActionLoadingId(null);
  };

  const handleShareAction = async (article: ArticleRow) => {
    const canOpen = Boolean(
      article.slug &&
        (article.status === "shared" || article.status === "published")
    );
    if (!canOpen || !article.slug) return;
    if (isSpecialIssueArticle(article)) {
      await copySpecialIssueShareLink(article);
      return;
    }
    window.open(
      `/share/${article.slug}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const cloneArticle = async (article: ArticleRow) => {
    setActionLoadingId(article.id);
    try {
      const { data: fullArticle, error: fetchError } = await supabase
        .from("articles")
        .select("*")
        .eq("id", article.id)
        .single();

      if (fetchError || !fullArticle) {
        notifications.show({
          title: "오류",
          message: "기사 데이터를 불러올 수 없습니다.",
          color: "red",
        });
        setActionLoadingId(null);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newSlug = `copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      const { data: newArticle, error: insertError } = await supabase
        .from("articles")
        .insert({
          title: `[복사] ${fullArticle.title}`,
          sub_title: fullArticle.sub_title,
          slug: newSlug,
          content: fullArticle.content,
          excerpt: fullArticle.excerpt,
          summary: fullArticle.summary,
          category_id: fullArticle.category_id,
          author_id: user?.id ?? fullArticle.author_id,
          status: "draft",
          seo_title: fullArticle.seo_title
            ? `[복사] ${fullArticle.seo_title}`
            : null,
          seo_description: fullArticle.seo_description,
          keywords: fullArticle.keywords,
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError || !newArticle) {
        notifications.show({
          title: "오류",
          message: `복제 실패: ${insertError?.message || "알 수 없는 오류"}`,
          color: "red",
        });
        setActionLoadingId(null);
        return;
      }

      const { data: tagRows } = await supabase
        .from("article_tags")
        .select("tag_id")
        .eq("article_id", article.id);

      if (tagRows && tagRows.length > 0) {
        await supabase
          .from("article_tags")
          .insert(
            tagRows.map((row) => ({
              article_id: newArticle.id,
              tag_id: row.tag_id,
            }))
          );
      }

      router.push(`/admin/write?id=${newArticle.id}`);
    } catch {
      notifications.show({
        title: "오류",
        message: "복제 중 오류가 발생했습니다.",
        color: "red",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ──── Bulk ──── */

  const applyBulkStatus = async () => {
    if (selectedArticleIds.length === 0) {
      notifications.show({
        title: "안내",
        message: "먼저 기사 항목을 선택해주세요.",
        color: "yellow",
      });
      return;
    }
    setBulkLoading(true);
    try {
      const selectedArticles = articles.filter((a) =>
        selectedArticleIds.includes(a.id)
      );
      const results = await Promise.all(
        selectedArticles.map((article) => {
          const payload = resolveStatusPayload(article, bulkStatusTarget);
          return supabase
            .from("articles")
            .update(payload)
            .eq("id", article.id);
        })
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        notifications.show({
          title: "오류",
          message: `일괄 상태 변경 실패: ${failed.error.message}`,
          color: "red",
        });
        return;
      }
      setSelectedArticleIds([]);
      triggerRefresh();
    } finally {
      setBulkLoading(false);
    }
  };

  const confirmDeleteArticle = async (article: ArticleRow) => {
    setDeleteModalArticle(null);
    setActionLoadingId(article.id);
    const { count, error } = await supabase
      .from("articles")
      .delete({ count: "exact" })
      .eq("id", article.id);
    if (error)
      notifications.show({
        title: "오류",
        message: `삭제 실패: ${error.message}`,
        color: "red",
      });
    else if (!count)
      notifications.show({
        title: "안내",
        message: "삭제된 기사가 없습니다.",
        color: "yellow",
      });
    else triggerRefresh();
    setActionLoadingId(null);
  };

  const deleteSelectedArticles = async () => {
    if (selectedArticleIds.length === 0) {
      notifications.show({
        title: "안내",
        message: "삭제할 기사 항목을 선택해주세요.",
        color: "yellow",
      });
      return;
    }
    const confirmed = window.confirm(
      `선택한 ${selectedArticleIds.length}건을 삭제할까요?`
    );
    if (!confirmed) return;
    setBulkLoading(true);
    try {
      const { count, error } = await supabase
        .from("articles")
        .delete({ count: "exact" })
        .in("id", selectedArticleIds);
      if (error) {
        notifications.show({
          title: "오류",
          message: `일괄 삭제 실패: ${error.message}`,
          color: "red",
        });
        return;
      }
      if (!count) {
        notifications.show({
          title: "안내",
          message: "삭제된 기사가 없습니다.",
          color: "yellow",
        });
        return;
      }
      setSelectedArticleIds([]);
      triggerRefresh();
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleArticleSelection = (
    articleId: string,
    checked: boolean
  ) => {
    setSelectedArticleIds((cur) => {
      if (checked)
        return cur.includes(articleId) ? cur : [...cur, articleId];
      return cur.filter((id) => id !== articleId);
    });
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      setSelectedArticleIds(articles.map((a) => a.id));
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
    setPage(1);
    triggerRefresh();
  };

  const selectedCount = selectedArticleIds.length;
  const allVisibleSelected =
    articles.length > 0 && selectedCount === articles.length;
  const hasActiveFilters =
    statusFilter !== "all" ||
    sortFilter !== "latest" ||
    searchTerm.trim().length > 0;

  return {
    articles,
    loading,
    searchTerm,
    setSearchTerm,
    searchTermRef,
    statusFilter,
    setStatusFilter,
    sortFilter,
    setSortFilter,
    selectedArticleIds,
    setSelectedArticleIds,
    bulkStatusTarget,
    setBulkStatusTarget,
    actionLoadingId,
    bulkLoading,
    deleteModalArticle,
    setDeleteModalArticle,
    page,
    setPage,
    totalCount,
    totalPages,
    statsTotal,
    statsPublished,
    statsDraft,
    statsPending,
    selectedCount,
    allVisibleSelected,
    hasActiveFilters,
    triggerRefresh,
    updateStatus,
    handleShareAction,
    cloneArticle,
    applyBulkStatus,
    confirmDeleteArticle,
    deleteSelectedArticles,
    toggleArticleSelection,
    toggleSelectAllVisible,
    resetFilters,
  };
}
