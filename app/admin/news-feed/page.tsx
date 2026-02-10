"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { nfFetch, isNewsFactoryConfigured } from "@/lib/news-factory";

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

/* ──────── Toast helper ──────── */

function showToast(msg: string) {
  const el = document.createElement("div");
  el.className = "nf-toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("nf-toast--visible"));
  setTimeout(() => {
    el.classList.remove("nf-toast--visible");
    setTimeout(() => el.remove(), 300);
  }, 2500);
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
      showToast("기사를 가져왔습니다 ✓");
    } catch (err) {
      showToast(
        `가져오기 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`
      );
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
      showToast(sub.is_active ? "구독 비활성화됨" : "구독 활성화됨");
    } catch (err) {
      showToast(
        `변경 실패: ${err instanceof Error ? err.message : "오류"}`
      );
    }
  };

  const deleteSub = async (sub: NfSubscription) => {
    if (!confirm(`"${sub.name}" 구독을 삭제하시겠습니까?`)) return;
    try {
      await nfFetch(`/api/v1/subscriptions/${sub.id}`, { method: "DELETE" });
      await fetchSubscriptions();
      showToast("구독이 삭제되었습니다");
    } catch (err) {
      showToast(
        `삭제 실패: ${err instanceof Error ? err.message : "오류"}`
      );
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
      <div className="admin2-grid admin2-grid--single">
        <div className="admin2-panel">
          <div className="admin2-panel-title">뉴스 피드</div>
          <div className="admin2-placeholder">
            뉴스 팩토리 연결 설정이 필요합니다.
            <br />
            <code style={{ fontSize: 12, marginTop: 8, display: "inline-block" }}>
              NEXT_PUBLIC_NEWS_FACTORY_URL, NEXT_PUBLIC_NEWS_FACTORY_API_KEY
            </code>
            &nbsp;환경변수를 설정해 주세요.
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "explore", label: "기사 탐색" },
    { key: "subscriptions", label: "구독 관리" },
    { key: "deliveries", label: "전송 이력" },
  ];

  const totalPages = Math.max(1, Math.ceil(totalArticles / LIMIT));

  return (
    <div className="admin2-grid admin2-grid--single">
      <div className="admin2-dashboard">
        {/* Header */}
        <div className="admin2-panel">
          <div className="admin2-panel-title">뉴스 피드</div>
          <div className="admin2-hero-title admin2-display" style={{ fontSize: 24 }}>
            뉴스 팩토리 피드
          </div>
          <div className="admin2-hero-sub">
            AI 생성 기사를 탐색하고, 구독을 관리합니다.
          </div>
        </div>

        {/* Tab nav */}
        <div className="admin2-nav nf-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? "active" : undefined}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ────── Tab: Explore ────── */}
        {tab === "explore" && (
          <>
            {/* Filters */}
            <div className="admin2-panel nf-filter-panel">
              <div className="nf-filters">
                {regions.length > 0 && (
                  <div className="admin2-desk-select">
                    <span>지역</span>
                    <select
                      value={filterRegion}
                      onChange={(e) => setFilterRegion(e.target.value)}
                    >
                      <option value="">전체</option>
                      {regions.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="admin2-desk-select">
                    <span>카테고리</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">전체</option>
                      {categories.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="admin2-desk-select">
                  <span>키워드</span>
                  <input
                    type="text"
                    className="nf-input"
                    placeholder="검색어 입력"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                  />
                </div>
                <div className="admin2-desk-select">
                  <span>시작일</span>
                  <input
                    type="date"
                    className="nf-input"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                  />
                </div>
                <div className="admin2-desk-select">
                  <span>종료일</span>
                  <input
                    type="date"
                    className="nf-input"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Article list */}
            {articlesError && (
              <div className="admin2-panel">
                <div className="admin2-placeholder" style={{ color: "var(--admin2-accent)" }}>
                  {articlesError}
                </div>
              </div>
            )}

            {articlesLoading ? (
              <div className="admin2-panel">
                <div className="admin2-placeholder">기사를 불러오는 중…</div>
              </div>
            ) : articles.length === 0 && !articlesError ? (
              <div className="admin2-panel">
                <div className="admin2-placeholder">표시할 기사가 없습니다.</div>
              </div>
            ) : (
              <div className="admin2-queue">
                {articles.map((art) => (
                  <div key={art.id} className="admin2-queue-item nf-article-card">
                    <div>
                      <div className="admin2-queue-title">{art.title}</div>
                      {art.summary && (
                        <div className="admin2-queue-meta" style={{ marginTop: 4 }}>
                          {art.summary.slice(0, 120)}
                          {art.summary.length > 120 ? "…" : ""}
                        </div>
                      )}
                      <div className="nf-article-meta">
                        {art.category && (
                          <span className="admin2-tag admin2-tag--draft">
                            {art.category}
                          </span>
                        )}
                        {art.region && (
                          <span className="admin2-tag admin2-tag--scheduled">
                            {art.region}
                          </span>
                        )}
                        {art.source && (
                          <span className="nf-source">{art.source}</span>
                        )}
                        {(art.published_at || art.created_at) && (
                          <span className="nf-date">
                            {new Date(
                              art.published_at || art.created_at || ""
                            ).toLocaleDateString("ko-KR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="nf-article-actions">
                      <button
                        className="admin2-btn admin2-btn-accent"
                        disabled={importingIds.has(art.id)}
                        onClick={() => importArticle(art)}
                      >
                        {importingIds.has(art.id) ? "가져오는 중…" : "가져오기"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalArticles > LIMIT && (
              <div className="admin2-desk-pagination">
                <button
                  className="admin2-btn admin2-btn-ghost"
                  disabled={page === 0}
                  onClick={() => goPage(page - 1)}
                >
                  ← 이전
                </button>
                <span className="admin2-desk-pagination-info">
                  {page + 1} / {totalPages}
                </span>
                <button
                  className="admin2-btn admin2-btn-ghost"
                  disabled={page >= totalPages - 1}
                  onClick={() => goPage(page + 1)}
                >
                  다음 →
                </button>
              </div>
            )}
          </>
        )}

        {/* ────── Tab: Subscriptions ────── */}
        {tab === "subscriptions" && (
          <>
            <div className="admin2-panel">
              <div
                className="admin2-desk-list-head"
                style={{ marginBottom: 0 }}
              >
                <div className="admin2-panel-title" style={{ marginBottom: 0 }}>
                  구독 목록
                </div>
                <button
                  className="admin2-btn admin2-btn-ink"
                  onClick={() => {
                    setEditingSub(null);
                    setShowSubModal(true);
                  }}
                >
                  + 구독 추가
                </button>
              </div>
            </div>

            {subsError && (
              <div className="admin2-panel">
                <div
                  className="admin2-placeholder"
                  style={{ color: "var(--admin2-accent)" }}
                >
                  {subsError}
                </div>
              </div>
            )}

            {subsLoading ? (
              <div className="admin2-panel">
                <div className="admin2-placeholder">구독 목록을 불러오는 중…</div>
              </div>
            ) : subscriptions.length === 0 && !subsError ? (
              <div className="admin2-panel">
                <div className="admin2-placeholder">
                  등록된 구독이 없습니다. 구독을 추가해 보세요.
                </div>
              </div>
            ) : (
              <div className="admin2-queue">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="admin2-queue-item">
                    <div>
                      <div className="admin2-queue-title">
                        {sub.name}
                        <span
                          className={`admin2-tag ${sub.is_active ? "admin2-tag--published" : "admin2-tag--draft"}`}
                          style={{ marginLeft: 8, verticalAlign: "middle" }}
                        >
                          {sub.is_active ? "활성" : "비활성"}
                        </span>
                      </div>
                      <div className="admin2-queue-meta">
                        {sub.filters?.regions?.length
                          ? `지역: ${sub.filters.regions.join(", ")}`
                          : ""}
                        {sub.filters?.regions?.length && sub.filters?.categories?.length
                          ? " · "
                          : ""}
                        {sub.filters?.categories?.length
                          ? `카테고리: ${sub.filters.categories.join(", ")}`
                          : ""}
                      </div>
                      <div className="admin2-queue-meta">
                        스케줄: {cronToKorean(sub.schedule || "")}
                        {sub.max_articles ? ` · 최대 ${sub.max_articles}건` : ""}
                      </div>
                    </div>
                    <div className="nf-sub-actions">
                      <button
                        className="admin2-btn admin2-btn-ghost"
                        onClick={() => toggleSubActive(sub)}
                      >
                        {sub.is_active ? "비활성화" : "활성화"}
                      </button>
                      <button
                        className="admin2-btn admin2-btn-ghost"
                        onClick={() => {
                          setEditingSub(sub);
                          setShowSubModal(true);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="admin2-btn admin2-btn-ghost"
                        style={{
                          color: "var(--admin2-accent)",
                          borderColor: "rgba(185,28,28,0.35)",
                        }}
                        onClick={() => deleteSub(sub)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="admin2-panel">
                <div
                  className="admin2-placeholder"
                  style={{ color: "var(--admin2-accent)" }}
                >
                  {deliveriesError}
                </div>
              </div>
            )}

            {deliveriesLoading ? (
              <div className="admin2-panel">
                <div className="admin2-placeholder">전송 이력을 불러오는 중…</div>
              </div>
            ) : deliveries.length === 0 && !deliveriesError ? (
              <div className="admin2-panel">
                <div className="admin2-placeholder">전송 이력이 없습니다.</div>
              </div>
            ) : (
              <div className="admin2-panel" style={{ padding: 0, overflow: "hidden" }}>
                <div className="admin2-desk-table-wrap">
                  <table className="admin2-desk-table" style={{ minWidth: 700 }}>
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>구독명</th>
                        <th>전송 기사 수</th>
                        <th>상태</th>
                        <th>에러 메시지</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((d) => (
                        <tr key={d.id}>
                          <td>
                            {d.delivered_at
                              ? new Date(d.delivered_at).toLocaleString("ko-KR")
                              : "—"}
                          </td>
                          <td>{d.subscription_name || d.subscription_id || "—"}</td>
                          <td>{d.article_count ?? "—"}</td>
                          <td>
                            <span
                              className={`admin2-tag ${d.status === "success" ? "admin2-tag--published" : d.status === "failed" ? "admin2-tag--alert" : "admin2-tag--draft"}`}
                            >
                              {d.status === "success"
                                ? "성공"
                                : d.status === "failed"
                                  ? "실패"
                                  : d.status || "—"}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--admin2-muted)" }}>
                            {d.error || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
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

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const schedule = cronPreset || cronCustom;

  const toggleInList = (list: string[], val: string) =>
    list.includes(val) ? list.filter((v) => v !== val) : [...list, val];

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("구독 이름을 입력해 주세요.");
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
        showToast("구독이 수정되었습니다");
      } else {
        await nfFetch("/api/v1/subscriptions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("구독이 추가되었습니다");
      }
      onSaved();
    } catch (err) {
      showToast(
        `저장 실패: ${err instanceof Error ? err.message : "오류"}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nf-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={editing ? "구독 수정" : "구독 추가"}>
      <div
        className="admin2-panel nf-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin2-panel-title" style={{ marginBottom: 16 }}>
          {editing ? "구독 수정" : "구독 추가"}
        </div>

        {/* Name */}
        <div className="nf-field">
          <label>구독 이름</label>
          <input
            className="nf-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 광주 행정 뉴스"
          />
        </div>

        {/* Regions */}
        {regions.length > 0 && (
          <div className="nf-field">
            <label>지역 (다중 선택)</label>
            <div className="nf-chip-group">
              {regions.map((r) => (
                <button
                  key={r.code}
                  className={`admin2-chip ${selRegions.includes(r.code) ? "active" : ""}`}
                  onClick={() => setSelRegions(toggleInList(selRegions, r.code))}
                  type="button"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="nf-field">
            <label>카테고리 (다중 선택)</label>
            <div className="nf-chip-group">
              {categories.map((c) => (
                <button
                  key={c.code}
                  className={`admin2-chip ${selCategories.includes(c.code) ? "active" : ""}`}
                  onClick={() =>
                    setSelCategories(toggleInList(selCategories, c.code))
                  }
                  type="button"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="nf-field">
          <label>스케줄</label>
          <div className="nf-chip-group">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.label}
                className={`admin2-chip ${cronPreset === p.value && p.value ? "active" : !cronPreset && p.value === "" ? "active" : ""}`}
                onClick={() => {
                  setCronPreset(p.value);
                  if (p.value) setCronCustom(p.value);
                }}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
          {!cronPreset && (
            <input
              className="nf-input"
              style={{ marginTop: 8 }}
              value={cronCustom}
              onChange={(e) => setCronCustom(e.target.value)}
              placeholder="cron 표현식 (예: 0 9 * * 1-5)"
            />
          )}
        </div>

        {/* Max articles */}
        <div className="nf-field">
          <label>최대 기사 수</label>
          <input
            className="nf-input"
            type="number"
            min={1}
            max={100}
            value={maxArticles}
            onChange={(e) => setMaxArticles(Number(e.target.value) || 10)}
          />
        </div>

        {/* Webhook URL (optional) */}
        <div className="nf-field">
          <label>웹훅 URL (선택)</label>
          <input
            className="nf-input"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Actions */}
        <div className="nf-modal-actions">
          <button className="admin2-btn admin2-btn-ghost" onClick={onClose}>
            취소
          </button>
          <button
            className="admin2-btn admin2-btn-ink"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "저장 중…" : editing ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
