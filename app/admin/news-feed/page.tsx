"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
    Stack,
    Group,
    Paper,
    Text,
    Button,
    Select,
    TextInput,
    Table,
    Badge,
    Center,
    Loader,
    Box,
    Modal,
    SimpleGrid,
    Title,
    Pagination,
    Chip,
    NumberInput,
    ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createClient } from "@/utils/supabase/client";
import { nfFetch, isNewsFactoryConfigured } from "@/lib/news-factory";
import AdminHeader from "@/components/admin/AdminHeader";

/* ──────────────────────────── Types ──────────────────────────── */

interface NfArticle {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    category?: string;
    region?: string;
    source?: string;
    source_url?: string;
    published_at?: string;
    created_at?: string;
}

interface NfRegion {
    code: string;
    name: string;
}

interface NfCategory {
    code: string;
    name: string;
}

interface NfSubscription {
    id: string;
    name: string;
    filters?: {
        regions?: string[];
        categories?: string[];
    };
    schedule?: string;
    max_articles?: number;
    is_active?: boolean;
    webhook_url?: string;
    created_at?: string;
}

interface NfDelivery {
    id: string;
    subscription_id?: string;
    subscription_name?: string;
    delivered_at?: string;
    article_count?: number;
    status?: string;
    error?: string;
}

type TabKey = "explore" | "subscriptions" | "deliveries";

/* ──────── Category mapping (NF → KJTIMES) ──────── */

const CATEGORY_MAP: Record<string, string> = {
    행정: "society",
    복지: "society",
    문화: "culture",
    경제: "economy",
    안전: "society",
    기타: "society",
    정치: "politics",
    사회: "society",
    스포츠: "sports",
    오피니언: "opinion",
};

/* ──────── Cron presets ──────── */

const CRON_PRESETS: { label: string; value: string }[] = [
    { label: "매일 오전 9시", value: "0 9 * * *" },
    { label: "매일 오후 5시", value: "0 17 * * *" },
    { label: "매일 09:00 + 17:00", value: "0 9,17 * * *" },
    { label: "직접 입력", value: "" },
];

/* ──────── Cron → human-readable ──────── */

function cronToKorean(cron: string): string {
    if (!cron) return "—";
    const parts = cron.split(" ");
    if (parts.length < 5) return cron;

    const [min, hour, , , dayOfWeek] = parts;

    const days =
        dayOfWeek === "*"
            ? "매일"
            : dayOfWeek
                  .split(",")
                  .map(
                      (d) =>
                          ["일", "월", "화", "수", "목", "금", "토"][Number(d)] || d
                  )
                  .join(",") + "요일";

    const hours = hour.split(",");
    const times = hours
        .map((h) => {
            const n = Number(h);
            if (isNaN(n)) return h;
            const ampm = n < 12 ? "오전" : "오후";
            const h12 = n === 0 ? 12 : n > 12 ? n - 12 : n;
            return `${ampm} ${h12}:${min.padStart(2, "0")}`;
        })
        .join(" + ");

    return `${days} ${times}`;
}

/* ══════════════════════════════════════════════════════════════ */
/*  Component                                                    */
/* ══════════════════════════════════════════════════════════════ */

export default function NewsFeedPage() {
    const [supabase] = useState(() => createClient());
    const configured = isNewsFactoryConfigured();

    const [tab, setTab] = useState<TabKey>("explore");

    /* ── Explore state ── */
    const [articles, setArticles] = useState<NfArticle[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [articlesError, setArticlesError] = useState("");
    const [regions, setRegions] = useState<NfRegion[]>([]);
    const [categories, setCategories] = useState<NfCategory[]>([]);
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterKeyword, setFilterKeyword] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [page, setPage] = useState(0);
    const [totalArticles, setTotalArticles] = useState(0);
    const LIMIT = 20;
    const [importingIds, setImportingIds] = useState<Set<string>>(new Set());

    /* ── Subscriptions state ── */
    const [subscriptions, setSubscriptions] = useState<NfSubscription[]>([]);
    const [subsLoading, setSubsLoading] = useState(false);
    const [subsError, setSubsError] = useState("");
    const [showSubModal, setShowSubModal] = useState(false);
    const [editingSub, setEditingSub] = useState<NfSubscription | null>(null);

    /* ── Deliveries state ── */
    const [deliveries, setDeliveries] = useState<NfDelivery[]>([]);
    const [deliveriesLoading, setDeliveriesLoading] = useState(false);
    const [deliveriesError, setDeliveriesError] = useState("");

    /* ──────── Bootstrap: load regions + categories ──────── */

    const didInit = useRef(false);

    useEffect(() => {
        if (!configured || didInit.current) return;
        didInit.current = true;

        (async () => {
            try {
                const [r, c] = await Promise.all([
                    nfFetch<NfRegion[] | { data: NfRegion[] }>("/api/v1/regions").catch(
                        () => [] as NfRegion[]
                    ),
                    nfFetch<NfCategory[] | { data: NfCategory[] }>(
                        "/api/v1/categories"
                    ).catch(() => [] as NfCategory[]),
                ]);
                setRegions(Array.isArray(r) ? r : (r as { data: NfRegion[] }).data ?? []);
                setCategories(Array.isArray(c) ? c : (c as { data: NfCategory[] }).data ?? []);
            } catch {
                /* ignore – filters will be unavailable */
            }
        })();
    }, [configured]);

    /* ──────── Explore: fetch articles ──────── */

    const fetchArticles = useCallback(
        async (pageNum: number) => {
            if (!configured) return;
            setArticlesLoading(true);
            setArticlesError("");
            try {
                const params = new URLSearchParams();
                params.set("limit", String(LIMIT));
                params.set("offset", String(pageNum * LIMIT));
                if (filterRegion) params.set("region", filterRegion);
                if (filterCategory) params.set("category", filterCategory);
                if (filterKeyword) params.set("q", filterKeyword);
                if (filterFrom) params.set("from", filterFrom);
                if (filterTo) params.set("to", filterTo);

                const res = await nfFetch<
                    | { data: NfArticle[]; total?: number }
                    | NfArticle[]
                >(`/api/v1/articles?${params}`);

                if (Array.isArray(res)) {
                    setArticles(res);
                    setTotalArticles(res.length);
                } else {
                    setArticles(res.data ?? []);
                    setTotalArticles(res.total ?? (res.data?.length || 0));
                }
            } catch (err) {
                setArticlesError(
                    err instanceof Error ? err.message : "기사 목록을 가져오지 못했습니다."
                );
            } finally {
                setArticlesLoading(false);
            }
        },
        [configured, filterRegion, filterCategory, filterKeyword, filterFrom, filterTo]
    );

    useEffect(() => {
        if (tab === "explore") {
            setPage(0);
            fetchArticles(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, filterRegion, filterCategory, filterKeyword, filterFrom, filterTo]);

    const goPage = (p: number) => {
        setPage(p);
        fetchArticles(p);
    };

    /* ──────── Import article into Supabase ──────── */

    const importArticle = async (art: NfArticle) => {
        setImportingIds((s) => new Set(s).add(art.id));
        try {
            const categorySlug = CATEGORY_MAP[art.category || ""] || "society";
            const { data: catRow } = await supabase
                .from("categories")
                .select("id")
                .eq("slug", categorySlug)
                .single();

            const plainText = (art.content || art.summary || "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            const excerpt = plainText.slice(0, 160);

            const { error } = await supabase.from("articles").insert({
                title: art.title,
                content: art.content || art.summary || "",
                summary: art.summary || excerpt,
                excerpt,
                category_id: catRow?.id || null,
                status: "pending_review",
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
            notifications.show({ message: "기사를 가져왔습니다 ✓", color: "green" });
        } catch (err) {
            notifications.show({
                message: `가져오기 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
                color: "red",
            });
        } finally {
            setImportingIds((s) => {
                const n = new Set(s);
                n.delete(art.id);
                return n;
            });
        }
    };

    /* ──────── Subscriptions ──────── */

    const fetchSubscriptions = useCallback(async () => {
        if (!configured) return;
        setSubsLoading(true);
        setSubsError("");
        try {
            const res = await nfFetch<
                NfSubscription[] | { data: NfSubscription[] }
            >("/api/v1/subscriptions");
            const list = Array.isArray(res)
                ? res
                : (res as { data: NfSubscription[] }).data ?? [];
            setSubscriptions(list);
        } catch (err) {
            setSubsError(
                err instanceof Error ? err.message : "구독 목록을 가져오지 못했습니다."
            );
        } finally {
            setSubsLoading(false);
        }
    }, [configured]);

    useEffect(() => {
        if (tab === "subscriptions") fetchSubscriptions();
    }, [tab, fetchSubscriptions]);

    const toggleSubActive = async (sub: NfSubscription) => {
        try {
            await nfFetch(`/api/v1/subscriptions/${sub.id}`, {
                method: "PATCH",
                body: JSON.stringify({ is_active: !sub.is_active }),
            });
            await fetchSubscriptions();
            notifications.show({
                message: sub.is_active ? "구독 비활성화됨" : "구독 활성화됨",
                color: "blue",
            });
        } catch (err) {
            notifications.show({
                message: `변경 실패: ${err instanceof Error ? err.message : "오류"}`,
                color: "red",
            });
        }
    };

    const deleteSub = async (sub: NfSubscription) => {
        if (!confirm(`"${sub.name}" 구독을 삭제하시겠습니까?`)) return;
        try {
            await nfFetch(`/api/v1/subscriptions/${sub.id}`, { method: "DELETE" });
            await fetchSubscriptions();
            notifications.show({ message: "구독이 삭제되었습니다", color: "green" });
        } catch (err) {
            notifications.show({
                message: `삭제 실패: ${err instanceof Error ? err.message : "오류"}`,
                color: "red",
            });
        }
    };

    /* ──────── Deliveries ──────── */

    const fetchDeliveries = useCallback(async () => {
        if (!configured) return;
        setDeliveriesLoading(true);
        setDeliveriesError("");
        try {
            const res = await nfFetch<
                NfDelivery[] | { data: NfDelivery[] }
            >("/api/v1/deliveries");
            const list = Array.isArray(res)
                ? res
                : (res as { data: NfDelivery[] }).data ?? [];
            setDeliveries(list);
        } catch (err) {
            setDeliveriesError(
                err instanceof Error ? err.message : "전송 이력을 가져오지 못했습니다."
            );
        } finally {
            setDeliveriesLoading(false);
        }
    }, [configured]);

    useEffect(() => {
        if (tab === "deliveries") fetchDeliveries();
    }, [tab, fetchDeliveries]);

    /* ══════════════════════════════════════════════════════════ */
    /*  Render                                                    */
    /* ══════════════════════════════════════════════════════════ */

    if (!configured) {
        return (
            <Stack gap="lg">
                <AdminHeader title="뉴스 피드" subtitle="뉴스 팩토리 피드 관리" />
                <Paper withBorder radius="md" p="xl">
                    <Text c="dimmed">
                        뉴스 팩토리 연결 설정이 필요합니다.
                        <br />
                        <code style={{ fontSize: 12, marginTop: 8, display: "inline-block" }}>
                            NEXT_PUBLIC_NEWS_FACTORY_URL, NEXT_PUBLIC_NEWS_FACTORY_API_KEY
                        </code>
                        &nbsp;환경변수를 설정해 주세요.
                    </Text>
                </Paper>
            </Stack>
        );
    }

    const tabs: { key: TabKey; label: string }[] = [
        { key: "explore", label: "기사 탐색" },
        { key: "subscriptions", label: "구독 관리" },
        { key: "deliveries", label: "전송 이력" },
    ];

    const totalPages = Math.max(1, Math.ceil(totalArticles / LIMIT));

    return (
        <Stack gap="lg">
            <AdminHeader title="뉴스 피드" subtitle="AI 생성 기사를 탐색하고, 구독을 관리합니다." />

            {/* Tab nav */}
            <Group gap="xs">
                {tabs.map((t) => (
                    <Button
                        key={t.key}
                        variant={tab === t.key ? "filled" : "default"}
                        color={tab === t.key ? "dark" : undefined}
                        radius="xl"
                        size="sm"
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </Button>
                ))}
            </Group>

            {/* ────── Tab: Explore ────── */}
            {tab === "explore" && (
                <>
                    {/* Filters */}
                    <Paper withBorder radius="md" p="md">
                        <Group gap="md" align="flex-end" wrap="wrap">
                            {regions.length > 0 && (
                                <Select
                                    label="지역"
                                    placeholder="전체"
                                    data={[{ value: "", label: "전체" }, ...regions.map((r) => ({ value: r.code, label: r.name }))]}
                                    value={filterRegion}
                                    onChange={(v) => setFilterRegion(v || "")}
                                    clearable
                                    style={{ minWidth: 170 }}
                                />
                            )}
                            {categories.length > 0 && (
                                <Select
                                    label="카테고리"
                                    placeholder="전체"
                                    data={[{ value: "", label: "전체" }, ...categories.map((c) => ({ value: c.code, label: c.name }))]}
                                    value={filterCategory}
                                    onChange={(v) => setFilterCategory(v || "")}
                                    clearable
                                    style={{ minWidth: 170 }}
                                />
                            )}
                            <TextInput
                                label="키워드"
                                placeholder="검색어 입력"
                                value={filterKeyword}
                                onChange={(e) => setFilterKeyword(e.currentTarget.value)}
                                style={{ minWidth: 170 }}
                            />
                            <TextInput
                                label="시작일"
                                type="date"
                                value={filterFrom}
                                onChange={(e) => setFilterFrom(e.currentTarget.value)}
                            />
                            <TextInput
                                label="종료일"
                                type="date"
                                value={filterTo}
                                onChange={(e) => setFilterTo(e.currentTarget.value)}
                            />
                        </Group>
                    </Paper>

                    {/* Article list */}
                    {articlesError && (
                        <Paper withBorder radius="md" p="xl">
                            <Text c="red">{articlesError}</Text>
                        </Paper>
                    )}

                    {articlesLoading ? (
                        <Center py={64}>
                            <Stack align="center" gap="sm">
                                <Loader size="sm" />
                                <Text size="sm" c="dimmed">기사를 불러오는 중…</Text>
                            </Stack>
                        </Center>
                    ) : articles.length === 0 && !articlesError ? (
                        <Paper withBorder radius="md" p="xl">
                            <Text c="dimmed" ta="center">표시할 기사가 없습니다.</Text>
                        </Paper>
                    ) : (
                        <Stack gap="sm">
                            {articles.map((art) => (
                                <Paper key={art.id} withBorder radius="md" p="md">
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                            <Text size="sm" fw={600} mb={4}>{art.title}</Text>
                                            {art.summary && (
                                                <Text size="xs" c="dimmed" lineClamp={2} mb={8}>
                                                    {art.summary}
                                                </Text>
                                            )}
                                            <Group gap="xs">
                                                {art.category && (
                                                    <Badge variant="light" color="gray" size="xs">{art.category}</Badge>
                                                )}
                                                {art.region && (
                                                    <Badge variant="light" color="blue" size="xs">{art.region}</Badge>
                                                )}
                                                {art.source && (
                                                    <Text size="xs" c="dimmed">{art.source}</Text>
                                                )}
                                                {(art.published_at || art.created_at) && (
                                                    <Text size="xs" c="dimmed">
                                                        {new Date(
                                                            art.published_at || art.created_at || ""
                                                        ).toLocaleDateString("ko-KR")}
                                                    </Text>
                                                )}
                                            </Group>
                                        </Box>
                                        <Button
                                            variant="filled"
                                            color="red"
                                            size="xs"
                                            loading={importingIds.has(art.id)}
                                            onClick={() => importArticle(art)}
                                        >
                                            가져오기
                                        </Button>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {/* Pagination */}
                    {totalArticles > LIMIT && (
                        <Center>
                            <Group gap="md">
                                <Button
                                    variant="default"
                                    size="xs"
                                    disabled={page === 0}
                                    onClick={() => goPage(page - 1)}
                                >
                                    ← 이전
                                </Button>
                                <Text size="sm" fw={600}>
                                    {page + 1} / {totalPages}
                                </Text>
                                <Button
                                    variant="default"
                                    size="xs"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => goPage(page + 1)}
                                >
                                    다음 →
                                </Button>
                            </Group>
                        </Center>
                    )}
                </>
            )}

            {/* ────── Tab: Subscriptions ────── */}
            {tab === "subscriptions" && (
                <>
                    <Group justify="space-between">
                        <Title order={5} c="dimmed" tt="uppercase" lts={2}>
                            구독 목록
                        </Title>
                        <Button
                            color="dark"
                            size="xs"
                            onClick={() => {
                                setEditingSub(null);
                                setShowSubModal(true);
                            }}
                        >
                            + 구독 추가
                        </Button>
                    </Group>

                    {subsError && (
                        <Paper withBorder radius="md" p="xl">
                            <Text c="red">{subsError}</Text>
                        </Paper>
                    )}

                    {subsLoading ? (
                        <Center py={64}>
                            <Stack align="center" gap="sm">
                                <Loader size="sm" />
                                <Text size="sm" c="dimmed">구독 목록을 불러오는 중…</Text>
                            </Stack>
                        </Center>
                    ) : subscriptions.length === 0 && !subsError ? (
                        <Paper withBorder radius="md" p="xl">
                            <Text c="dimmed" ta="center">
                                등록된 구독이 없습니다. 구독을 추가해 보세요.
                            </Text>
                        </Paper>
                    ) : (
                        <Stack gap="sm">
                            {subscriptions.map((sub) => (
                                <Paper key={sub.id} withBorder radius="md" p="md">
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                            <Group gap="xs" mb={4}>
                                                <Text size="sm" fw={600}>{sub.name}</Text>
                                                <Badge
                                                    variant="light"
                                                    color={sub.is_active ? "green" : "gray"}
                                                    size="xs"
                                                >
                                                    {sub.is_active ? "활성" : "비활성"}
                                                </Badge>
                                            </Group>
                                            <Text size="xs" c="dimmed">
                                                {sub.filters?.regions?.length
                                                    ? `지역: ${sub.filters.regions.join(", ")}`
                                                    : ""}
                                                {sub.filters?.regions?.length && sub.filters?.categories?.length
                                                    ? " · "
                                                    : ""}
                                                {sub.filters?.categories?.length
                                                    ? `카테고리: ${sub.filters.categories.join(", ")}`
                                                    : ""}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                스케줄: {cronToKorean(sub.schedule || "")}
                                                {sub.max_articles ? ` · 최대 ${sub.max_articles}건` : ""}
                                            </Text>
                                        </Box>
                                        <Group gap="xs">
                                            <Button
                                                variant="default"
                                                size="xs"
                                                onClick={() => toggleSubActive(sub)}
                                            >
                                                {sub.is_active ? "비활성화" : "활성화"}
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="xs"
                                                onClick={() => {
                                                    setEditingSub(sub);
                                                    setShowSubModal(true);
                                                }}
                                            >
                                                수정
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="xs"
                                                color="red"
                                                onClick={() => deleteSub(sub)}
                                            >
                                                삭제
                                            </Button>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {/* Subscription modal */}
                    {showSubModal && (
                        <SubscriptionModal
                            regions={regions}
                            categories={categories}
                            editing={editingSub}
                            onClose={() => setShowSubModal(false)}
                            onSaved={() => {
                                setShowSubModal(false);
                                fetchSubscriptions();
                            }}
                        />
                    )}
                </>
            )}

            {/* ────── Tab: Deliveries ────── */}
            {tab === "deliveries" && (
                <>
                    {deliveriesError && (
                        <Paper withBorder radius="md" p="xl">
                            <Text c="red">{deliveriesError}</Text>
                        </Paper>
                    )}

                    {deliveriesLoading ? (
                        <Center py={64}>
                            <Stack align="center" gap="sm">
                                <Loader size="sm" />
                                <Text size="sm" c="dimmed">전송 이력을 불러오는 중…</Text>
                            </Stack>
                        </Center>
                    ) : deliveries.length === 0 && !deliveriesError ? (
                        <Paper withBorder radius="md" p="xl">
                            <Text c="dimmed" ta="center">전송 이력이 없습니다.</Text>
                        </Paper>
                    ) : (
                        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>날짜</Table.Th>
                                        <Table.Th>구독명</Table.Th>
                                        <Table.Th>전송 기사 수</Table.Th>
                                        <Table.Th>상태</Table.Th>
                                        <Table.Th>에러 메시지</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {deliveries.map((d) => (
                                        <Table.Tr key={d.id}>
                                            <Table.Td>
                                                {d.delivered_at
                                                    ? new Date(d.delivered_at).toLocaleString("ko-KR")
                                                    : "—"}
                                            </Table.Td>
                                            <Table.Td>{d.subscription_name || d.subscription_id || "—"}</Table.Td>
                                            <Table.Td>{d.article_count ?? "—"}</Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    variant="light"
                                                    color={
                                                        d.status === "success"
                                                            ? "green"
                                                            : d.status === "failed"
                                                                ? "red"
                                                                : "gray"
                                                    }
                                                    size="xs"
                                                >
                                                    {d.status === "success"
                                                        ? "성공"
                                                        : d.status === "failed"
                                                            ? "실패"
                                                            : d.status || "—"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="xs" c="dimmed">
                                                    {d.error || "—"}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    )}
                </>
            )}
        </Stack>
    );
}

/* ══════════════════════════════════════════════════════════════ */
/*  Subscription Modal                                           */
/* ══════════════════════════════════════════════════════════════ */

function SubscriptionModal({
    regions,
    categories,
    editing,
    onClose,
    onSaved,
}: {
    regions: NfRegion[];
    categories: NfCategory[];
    editing: NfSubscription | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(editing?.name || "");
    const [selRegions, setSelRegions] = useState<string[]>(
        editing?.filters?.regions || []
    );
    const [selCategories, setSelCategories] = useState<string[]>(
        editing?.filters?.categories || []
    );
    const [cronPreset, setCronPreset] = useState(() => {
        const match = CRON_PRESETS.find((p) => p.value === editing?.schedule);
        return match ? match.value : "";
    });
    const [cronCustom, setCronCustom] = useState(editing?.schedule || "");
    const [maxArticles, setMaxArticles] = useState(editing?.max_articles ?? 10);
    const [webhookUrl, setWebhookUrl] = useState(editing?.webhook_url || "");
    const [saving, setSaving] = useState(false);

    const schedule = cronPreset || cronCustom;

    const toggleInList = (list: string[], val: string) =>
        list.includes(val) ? list.filter((v) => v !== val) : [...list, val];

    const handleSave = async () => {
        if (!name.trim()) {
            notifications.show({ message: "구독 이름을 입력해 주세요.", color: "orange" });
            return;
        }
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                name: name.trim(),
                filters: {
                    regions: selRegions,
                    categories: selCategories,
                },
                schedule,
                max_articles: maxArticles,
            };
            if (webhookUrl) payload.webhook_url = webhookUrl;

            if (editing) {
                await nfFetch(`/api/v1/subscriptions/${editing.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
                notifications.show({ message: "구독이 수정되었습니다", color: "green" });
            } else {
                await nfFetch("/api/v1/subscriptions", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                notifications.show({ message: "구독이 추가되었습니다", color: "green" });
            }
            onSaved();
        } catch (err) {
            notifications.show({
                message: `저장 실패: ${err instanceof Error ? err.message : "오류"}`,
                color: "red",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            opened
            onClose={onClose}
            title={editing ? "구독 수정" : "구독 추가"}
            centered
            size="md"
        >
            <Stack gap="md">
                {/* Name */}
                <TextInput
                    label="구독 이름"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="예: 광주 행정 뉴스"
                />

                {/* Regions */}
                {regions.length > 0 && (
                    <Box>
                        <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase" lts={1}>
                            지역 (다중 선택)
                        </Text>
                        <Group gap="xs">
                            {regions.map((r) => (
                                <Button
                                    key={r.code}
                                    variant={selRegions.includes(r.code) ? "filled" : "default"}
                                    color={selRegions.includes(r.code) ? "dark" : undefined}
                                    size="xs"
                                    radius="xl"
                                    onClick={() => setSelRegions(toggleInList(selRegions, r.code))}
                                >
                                    {r.name}
                                </Button>
                            ))}
                        </Group>
                    </Box>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                    <Box>
                        <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase" lts={1}>
                            카테고리 (다중 선택)
                        </Text>
                        <Group gap="xs">
                            {categories.map((c) => (
                                <Button
                                    key={c.code}
                                    variant={selCategories.includes(c.code) ? "filled" : "default"}
                                    color={selCategories.includes(c.code) ? "dark" : undefined}
                                    size="xs"
                                    radius="xl"
                                    onClick={() =>
                                        setSelCategories(toggleInList(selCategories, c.code))
                                    }
                                >
                                    {c.name}
                                </Button>
                            ))}
                        </Group>
                    </Box>
                )}

                {/* Schedule */}
                <Box>
                    <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase" lts={1}>
                        스케줄
                    </Text>
                    <Group gap="xs">
                        {CRON_PRESETS.map((p) => (
                            <Button
                                key={p.label}
                                variant={
                                    (cronPreset === p.value && p.value) ||
                                    (!cronPreset && p.value === "")
                                        ? "filled"
                                        : "default"
                                }
                                color={
                                    (cronPreset === p.value && p.value) ||
                                    (!cronPreset && p.value === "")
                                        ? "dark"
                                        : undefined
                                }
                                size="xs"
                                radius="xl"
                                onClick={() => {
                                    setCronPreset(p.value);
                                    if (p.value) setCronCustom(p.value);
                                }}
                            >
                                {p.label}
                            </Button>
                        ))}
                    </Group>
                    {!cronPreset && (
                        <TextInput
                            mt="xs"
                            value={cronCustom}
                            onChange={(e) => setCronCustom(e.currentTarget.value)}
                            placeholder="cron 표현식 (예: 0 9 * * 1-5)"
                        />
                    )}
                </Box>

                {/* Max articles */}
                <TextInput
                    label="최대 기사 수"
                    type="number"
                    min={1}
                    max={100}
                    value={String(maxArticles)}
                    onChange={(e) => setMaxArticles(Number(e.currentTarget.value) || 10)}
                />

                {/* Webhook URL */}
                <TextInput
                    label="웹훅 URL (선택)"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.currentTarget.value)}
                    placeholder="https://..."
                />

                {/* Actions */}
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose}>
                        취소
                    </Button>
                    <Button
                        color="dark"
                        loading={saving}
                        onClick={handleSave}
                    >
                        {editing ? "수정" : "추가"}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
