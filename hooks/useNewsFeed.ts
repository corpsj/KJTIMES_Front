"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { createClient } from "@/utils/supabase/client";
import { nfFetch, isNewsFactoryConfigured } from "@/lib/news-factory";

/* ──────────────────────────── Types ──────────────────────────── */

export interface NfArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  source?: string;
  source_url?: string;
  images?: string[];
  published_at?: string;
  processed_at?: string;
}

export interface NfRegion {
  code: string;
  name: string;
}

export interface NfCategory {
  code: string;
  name: string;
}

export interface NfSubscription {
  id: string;
  name: string | null;
  filter_regions: string[] | null;
  filter_categories: string[] | null;
  filter_keywords: string[] | null;
  schedule_cron: string;
  schedule_tz?: string;
  max_articles: number;
  is_active: boolean;
  last_delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NfDelivery {
  id: string;
  subscription_id?: string;
  article_ids?: string[];
  article_count?: number;
  status?: string;
  error_message?: string;
  delivered_at?: string;
}

export type TabKey = "explore" | "subscriptions" | "deliveries";

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

export const CRON_PRESETS: { label: string; value: string }[] = [
  { label: "매일 오전 9시", value: "0 9 * * *" },
  { label: "매일 오후 5시", value: "0 17 * * *" },
  { label: "매일 09:00 + 17:00", value: "0 9,17 * * *" },
  { label: "직접 입력", value: "" },
];

/* ──────── Cron → human-readable ──────── */

export function cronToKorean(cron: string): string {
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

const LIMIT = 20;

/* ══════════════════════════════════════════════════════════════ */
/*  Hook                                                         */
/* ══════════════════════════════════════════════════════════════ */

export function useNewsFeed() {
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
        const [rRes, cRes] = await Promise.all([
          nfFetch<{ regions: NfRegion[] }>("/api/v1/regions").catch(
            () => ({ regions: [] as NfRegion[] })
          ),
          nfFetch<{ categories: NfCategory[] }>(
            "/api/v1/categories"
          ).catch(() => ({ categories: [] as NfCategory[] })),
        ]);
        setRegions(rRes.regions ?? []);
        setCategories(cRes.categories ?? []);
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
        if (filterKeyword) params.set("keyword", filterKeyword);
        if (filterFrom) params.set("from", filterFrom);
        if (filterTo) params.set("to", filterTo);

        const res = await nfFetch<{
          articles: NfArticle[];
          total: number;
          limit: number;
          offset: number;
        }>(`/api/v1/articles?${params}`);

        setArticles(res.articles ?? []);
        setTotalArticles(res.total ?? res.articles?.length ?? 0);
      } catch (err) {
        setArticlesError(
          err instanceof Error
            ? err.message
            : "기사 목록을 가져오지 못했습니다."
        );
      } finally {
        setArticlesLoading(false);
      }
    },
    [
      configured,
      filterRegion,
      filterCategory,
      filterKeyword,
      filterFrom,
      filterTo,
    ]
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
      const res = await nfFetch<{ subscriptions: NfSubscription[] }>(
        "/api/v1/subscriptions"
      );
      setSubscriptions(res.subscriptions ?? []);
    } catch (err) {
      setSubsError(
        err instanceof Error
          ? err.message
          : "구독 목록을 가져오지 못했습니다."
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
      const res = await nfFetch<{
        deliveries: NfDelivery[];
        total: number;
        limit: number;
        offset: number;
      }>("/api/v1/deliveries");
      setDeliveries(res.deliveries ?? []);
    } catch (err) {
      setDeliveriesError(
        err instanceof Error
          ? err.message
          : "전송 이력을 가져오지 못했습니다."
      );
    } finally {
      setDeliveriesLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    if (tab === "deliveries") fetchDeliveries();
  }, [tab, fetchDeliveries]);

  const totalPages = Math.max(1, Math.ceil(totalArticles / LIMIT));

  return {
    configured,
    tab,
    setTab,
    // explore
    articles,
    articlesLoading,
    articlesError,
    regions,
    categories,
    filterRegion,
    setFilterRegion,
    filterCategory,
    setFilterCategory,
    filterKeyword,
    setFilterKeyword,
    filterFrom,
    setFilterFrom,
    filterTo,
    setFilterTo,
    page,
    totalArticles,
    totalPages,
    goPage,
    importArticle,
    importingIds,
    // subscriptions
    subscriptions,
    subsLoading,
    subsError,
    showSubModal,
    setShowSubModal,
    editingSub,
    setEditingSub,
    fetchSubscriptions,
    toggleSubActive,
    deleteSub,
    // deliveries
    deliveries,
    deliveriesLoading,
    deliveriesError,
    LIMIT,
  };
}
