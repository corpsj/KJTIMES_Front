"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconArticle,
  IconCheck,
  IconCopy,
  IconDots,
  IconEdit,
  IconFileText,
  IconLink,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { createClient } from "@/utils/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";
const PAGE_SIZE = 20;

type ArticleRow = {
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

const inlineStatusOptions = statusOptions.filter((o) => o.value !== "all");

const validStatusValues = new Set(statusOptions.map((o) => o.value));
const validSortValues = new Set(sortOptions.map((o) => o.value));

export default function AdminArticles() {
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

  const [deleteModalArticle, setDeleteModalArticle] = useState<ArticleRow | null>(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statsTotal, setStatsTotal] = useState(0);
  const [statsPublished, setStatsPublished] = useState(0);
  const [statsDraft, setStatsDraft] = useState(0);
  const [statsPending, setStatsPending] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const getCategoryName = (categories: ArticleRow["categories"]) => {
    if (!categories) return "미분류";
    if (Array.isArray(categories)) return categories[0]?.name || "미분류";
    return categories.name || "미분류";
  };

  const getCategorySlug = (categories: ArticleRow["categories"]) => {
    if (!categories) return null;
    if (Array.isArray(categories)) return categories[0]?.slug || null;
    return categories.slug || null;
  };

  const isSpecialIssueArticle = (article: ArticleRow) =>
    getCategorySlug(article.categories) === SPECIAL_ISSUE_CATEGORY_SLUG;

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
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
    };
    fetchStats();
  }, [supabase, refreshToken]);

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
    setPage(1);
    setRefreshToken((prev) => prev + 1);
  }, [searchParamsKey]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);

      let countQuery = supabase.from("articles").select("id", { count: "exact", head: true });
      if (statusFilter !== "all") countQuery = countQuery.eq("status", statusFilter);
      const term = searchTermRef.current.trim().replace(/[%]/g, "");
      if (term) countQuery = countQuery.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);

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
        .select("id, title, slug, status, created_at, updated_at, published_at, views, categories(name, slug)");

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (term) query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);

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
      setSelectedArticleIds((cur) => cur.filter((id) => visibleIdSet.has(id)));
      setLoading(false);
    };

    fetchArticles();
  }, [statusFilter, sortFilter, supabase, refreshToken, page]);

  const triggerRefresh = () => setRefreshToken((p) => p + 1);

  const copyToClipboard = async (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    if (typeof document === "undefined") throw new Error("Clipboard unavailable");
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
      notifications.show({ title: "오류", message: "공유 링크를 생성할 수 없습니다.", color: "red" });
      return;
    }
    const isShareVisible = article.status === "shared" || article.status === "published";
    if (!isShareVisible) {
      notifications.show({ title: "안내", message: "공유/게시 상태에서만 링크를 복사할 수 있습니다.", color: "yellow" });
      return;
    }
    const shareUrl = `${window.location.origin}/share/${article.slug}`;
    try {
      await copyToClipboard(shareUrl);
      notifications.show({ title: "성공", message: "공유 링크를 복사했습니다.", color: "green" });
    } catch {
      notifications.show({ title: "오류", message: "링크 복사에 실패했습니다.", color: "red" });
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
    if (error) notifications.show({ title: "오류", message: `상태 변경 실패: ${error.message}`, color: "red" });
    else triggerRefresh();
    setActionLoadingId(null);
  };

  const handleShareAction = async (article: ArticleRow) => {
    const canOpen = Boolean(article.slug && (article.status === "shared" || article.status === "published"));
    if (!canOpen || !article.slug) return;
    if (isSpecialIssueArticle(article)) {
      await copySpecialIssueShareLink(article);
      return;
    }
    window.open(`/share/${article.slug}`, "_blank", "noopener,noreferrer");
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
        notifications.show({ title: "오류", message: "기사 데이터를 불러올 수 없습니다.", color: "red" });
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
          seo_title: fullArticle.seo_title ? `[복사] ${fullArticle.seo_title}` : null,
          seo_description: fullArticle.seo_description,
          keywords: fullArticle.keywords,
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError || !newArticle) {
        notifications.show({ title: "오류", message: `복제 실패: ${insertError?.message || "알 수 없는 오류"}`, color: "red" });
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
          .insert(tagRows.map((row) => ({ article_id: newArticle.id, tag_id: row.tag_id })));
      }

      router.push(`/admin/write?id=${newArticle.id}`);
    } catch {
      notifications.show({ title: "오류", message: "복제 중 오류가 발생했습니다.", color: "red" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const applyBulkStatus = async () => {
    if (selectedArticleIds.length === 0) {
      notifications.show({ title: "안내", message: "먼저 기사 항목을 선택해주세요.", color: "yellow" });
      return;
    }
    setBulkLoading(true);
    try {
      const selectedArticles = articles.filter((a) => selectedArticleIds.includes(a.id));
      const results = await Promise.all(
        selectedArticles.map((article) => {
          const payload = resolveStatusPayload(article, bulkStatusTarget);
          return supabase.from("articles").update(payload).eq("id", article.id);
        })
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        notifications.show({ title: "오류", message: `일괄 상태 변경 실패: ${failed.error.message}`, color: "red" });
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
    const { count, error } = await supabase.from("articles").delete({ count: "exact" }).eq("id", article.id);
    if (error) notifications.show({ title: "오류", message: `삭제 실패: ${error.message}`, color: "red" });
    else if (!count) notifications.show({ title: "안내", message: "삭제된 기사가 없습니다.", color: "yellow" });
    else triggerRefresh();
    setActionLoadingId(null);
  };

  const deleteSelectedArticles = async () => {
    if (selectedArticleIds.length === 0) {
      notifications.show({ title: "안내", message: "삭제할 기사 항목을 선택해주세요.", color: "yellow" });
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
        notifications.show({ title: "오류", message: `일괄 삭제 실패: ${error.message}`, color: "red" });
        return;
      }
      if (!count) {
        notifications.show({ title: "안내", message: "삭제된 기사가 없습니다.", color: "yellow" });
        return;
      }
      setSelectedArticleIds([]);
      triggerRefresh();
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleArticleSelection = (articleId: string, checked: boolean) => {
    setSelectedArticleIds((cur) => {
      if (checked) return cur.includes(articleId) ? cur : [...cur, articleId];
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
  const allVisibleSelected = articles.length > 0 && selectedCount === articles.length;
  const hasActiveFilters =
    statusFilter !== "all" || sortFilter !== "latest" || searchTerm.trim().length > 0;

  return (
    <Stack gap="lg">
      {/* Header */}
      <AdminHeader
        title="기사 관리"
        subtitle={`총 ${totalCount.toLocaleString()}건의 기사`}
        actions={
          <Button
            component={Link}
            href="/admin/write"
            leftSection={<IconPlus size={18} />}
          >
            새 기사 작성
          </Button>
        }
      />

      {/* Stats Row */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard
          label="전체 기사"
          value={statsTotal}
          icon={<IconArticle size={22} />}
          color="blue"
        />
        <StatCard
          label="게시"
          value={statsPublished}
          icon={<IconCheck size={22} />}
          color="green"
        />
        <StatCard
          label="작성"
          value={statsDraft}
          icon={<IconFileText size={22} />}
          color="gray"
        />
        <StatCard
          label="승인 대기"
          value={statsPending}
          icon={<IconSend size={22} />}
          color="yellow"
        />
      </SimpleGrid>

      {/* Filter Bar */}
      <Paper p="md" shadow="0 1px 3px rgba(0,0,0,0.08)" style={{ border: "1px solid #f1f3f5" }}>
        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder="제목 또는 슬러그 검색"
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.currentTarget.value);
              searchTermRef.current = e.currentTarget.value;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                triggerRefresh();
              }
            }}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select
            placeholder="상태"
            data={statusOptions.map((o) => ({ value: o.value, label: o.label }))}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val || "all");
              setPage(1);
            }}
            w={140}
            clearable={false}
          />
          <Select
            placeholder="정렬"
            data={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
            value={sortFilter}
            onChange={(val) => {
              setSortFilter(val || "latest");
              setPage(1);
            }}
            w={130}
            clearable={false}
          />
          {hasActiveFilters && (
            <Button variant="subtle" color="gray" onClick={resetFilters} disabled={bulkLoading}>
              초기화
            </Button>
          )}
        </Group>
      </Paper>

      {/* Batch Operations Bar */}
      {selectedCount > 0 && (
        <Paper
          p="sm"
          style={{
            border: "1px solid #228be6",
            backgroundColor: "rgba(34, 139, 230, 0.04)",
          }}
        >
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm">
              <Badge variant="light" size="lg">
                {selectedCount}건 선택
              </Badge>
              <Select
                size="xs"
                data={bulkStatusOptions.map((o) => ({ value: o.value, label: o.label }))}
                value={bulkStatusTarget}
                onChange={(val) => setBulkStatusTarget(val || "pending_review")}
                w={140}
                clearable={false}
              />
              <Button
                size="xs"
                variant="light"
                onClick={applyBulkStatus}
                disabled={bulkLoading}
              >
                상태 변경
              </Button>
              <Button
                size="xs"
                variant="light"
                color="red"
                onClick={deleteSelectedArticles}
                disabled={bulkLoading}
              >
                삭제
              </Button>
            </Group>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => setSelectedArticleIds([])}
            >
              선택 해제
            </Button>
          </Group>
        </Paper>
      )}

      {/* Article Table */}
      <Paper shadow="0 1px 3px rgba(0,0,0,0.08)" style={{ border: "1px solid #f1f3f5", overflow: "hidden" }}>
        {loading ? (
          <Stack align="center" py={60}>
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              불러오는 중...
            </Text>
          </Stack>
        ) : articles.length === 0 ? (
          <EmptyState
            icon={<IconArticle size={48} />}
            title="기사가 없습니다"
            description={hasActiveFilters ? "필터 조건에 맞는 기사가 없습니다." : "새 기사를 작성해 보세요."}
            action={
              hasActiveFilters ? (
                <Button variant="light" onClick={resetFilters}>
                  필터 초기화
                </Button>
              ) : (
                <Button component={Link} href="/admin/write" leftSection={<IconPlus size={16} />}>
                  새 기사 작성
                </Button>
              )
            }
          />
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={40}>
                    <Checkbox
                      checked={allVisibleSelected}
                      onChange={(e) => toggleSelectAllVisible(e.currentTarget.checked)}
                      aria-label="전체 선택"
                    />
                  </Table.Th>
                  <Table.Th>제목</Table.Th>
                  <Table.Th w={100}>상태</Table.Th>
                  <Table.Th w={140}>수정일</Table.Th>
                  <Table.Th w={80} ta="right">
                    조회수
                  </Table.Th>
                  <Table.Th w={60} ta="center">
                    작업
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => {
                  const isSelected = selectedArticleIds.includes(article.id);
                  const isSpecialIssue = isSpecialIssueArticle(article);
                  const canShare = Boolean(
                    article.slug && (article.status === "shared" || article.status === "published")
                  );

                  return (
                    <Table.Tr
                      key={article.id}
                      style={{
                        opacity: actionLoadingId === article.id ? 0.5 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      <Table.Td>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => toggleArticleSelection(article.id, e.currentTarget.checked)}
                          aria-label={`${article.title} 선택`}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Group gap="xs" wrap="nowrap">
                            <Text
                              component={Link}
                              href={`/admin/write?id=${article.id}`}
                              size="sm"
                              fw={500}
                              lineClamp={1}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              {article.title}
                            </Text>
                          </Group>
                          <Group gap={6}>
                            <Badge variant="outline" size="xs" color="gray">
                              {getCategoryName(article.categories)}
                            </Badge>
                            {isSpecialIssue && (
                              <Badge variant="light" size="xs" color="violet">
                                창간특별호
                              </Badge>
                            )}
                          </Group>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={article.status} />
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(article.updated_at || article.created_at).toLocaleDateString("ko-KR")}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="xs" c="dimmed">
                          {article.views?.toLocaleString() || 0}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Menu shadow="md" width={160} position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray" size="sm">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              component={Link}
                              href={`/admin/write?id=${article.id}`}
                            >
                              편집
                            </Menu.Item>
                            {canShare && (
                              <Menu.Item
                                leftSection={<IconLink size={14} />}
                                onClick={() => void handleShareAction(article)}
                              >
                                공유
                              </Menu.Item>
                            )}
                            <Menu.Item
                              leftSection={<IconCopy size={14} />}
                              onClick={() => void cloneArticle(article)}
                              disabled={actionLoadingId === article.id || bulkLoading}
                            >
                              복제
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label>상태 변경</Menu.Label>
                            {inlineStatusOptions.map((opt) => (
                              <Menu.Item
                                key={opt.value}
                                disabled={article.status === opt.value || actionLoadingId === article.id}
                                onClick={() => void updateStatus(article, opt.value)}
                                fz="xs"
                              >
                                {opt.label}
                              </Menu.Item>
                            ))}
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => setDeleteModalArticle(article)}
                              disabled={actionLoadingId === article.id || bulkLoading}
                            >
                              삭제
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <Group justify="center" py="md" style={{ borderTop: "1px solid #f1f3f5" }}>
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        )}
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteModalArticle}
        onClose={() => setDeleteModalArticle(null)}
        title="기사 삭제"
        centered
        size="sm"
      >
        {deleteModalArticle && (
          <Stack gap="md">
            <Text size="sm">
              &ldquo;{deleteModalArticle.title}&rdquo;
            </Text>
            <Text size="sm" c="dimmed">
              이 기사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </Text>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setDeleteModalArticle(null)}>
                취소
              </Button>
              <Button
                color="red"
                onClick={() => void confirmDeleteArticle(deleteModalArticle)}
              >
                삭제
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
