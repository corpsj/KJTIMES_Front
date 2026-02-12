"use client";

import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import AdminHeader from "@/components/admin/AdminHeader";
import NewsFeedFilters from "@/components/admin/news-feed/NewsFeedFilters";
import NewsFeedArticleList from "@/components/admin/news-feed/NewsFeedArticleList";
import NewsFeedSubscriptions from "@/components/admin/news-feed/NewsFeedSubscriptions";
import NewsFeedDeliveries from "@/components/admin/news-feed/NewsFeedDeliveries";
import SubscriptionModal from "@/components/admin/news-feed/SubscriptionModal";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import type { TabKey } from "@/hooks/useNewsFeed";

const tabs: { key: TabKey; label: string }[] = [
  { key: "explore", label: "기사 탐색" },
  { key: "subscriptions", label: "구독 관리" },
  { key: "deliveries", label: "전송 이력" },
];

export default function NewsFeedPage() {
  const nf = useNewsFeed();

  if (!nf.configured) {
    return (
      <Stack gap="lg">
        <AdminHeader title="뉴스 피드" subtitle="뉴스 팩토리 피드 관리" />
        <Paper withBorder radius="md" p="xl">
          <Text c="dimmed">
            뉴스 팩토리 연결 설정이 필요합니다.
            <br />
            <code
              style={{
                fontSize: 12,
                marginTop: 8,
                display: "inline-block",
              }}
            >
              NEWS_FACTORY_URL, NEWS_FACTORY_API_KEY,
              NEXT_PUBLIC_NEWS_FACTORY_ENABLED=true
            </code>
            &nbsp;환경변수를 설정해 주세요.
          </Text>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <AdminHeader
        title="뉴스 피드"
        subtitle="AI 생성 기사를 탐색하고, 구독을 관리합니다."
      />

      {/* Tab nav */}
      <Group gap="xs">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={nf.tab === t.key ? "filled" : "default"}
            color={nf.tab === t.key ? "dark" : undefined}
            radius="xl"
            size="sm"
            onClick={() => nf.setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </Group>

      {/* ── Tab: Explore ── */}
      {nf.tab === "explore" && (
        <>
          <NewsFeedFilters
            regions={nf.regions}
            categories={nf.categories}
            filterRegion={nf.filterRegion}
            setFilterRegion={nf.setFilterRegion}
            filterCategory={nf.filterCategory}
            setFilterCategory={nf.setFilterCategory}
            filterKeyword={nf.filterKeyword}
            setFilterKeyword={nf.setFilterKeyword}
            filterFrom={nf.filterFrom}
            setFilterFrom={nf.setFilterFrom}
            filterTo={nf.filterTo}
            setFilterTo={nf.setFilterTo}
          />
          <NewsFeedArticleList
            articles={nf.articles}
            loading={nf.articlesLoading}
            error={nf.articlesError}
            importingIds={nf.importingIds}
            onImport={nf.importArticle}
            page={nf.page}
            totalArticles={nf.totalArticles}
            totalPages={nf.totalPages}
            limit={nf.LIMIT}
            onPageChange={nf.goPage}
          />
        </>
      )}

      {/* ── Tab: Subscriptions ── */}
      {nf.tab === "subscriptions" && (
        <>
          <NewsFeedSubscriptions
            subscriptions={nf.subscriptions}
            loading={nf.subsLoading}
            error={nf.subsError}
            onAdd={() => {
              nf.setEditingSub(null);
              nf.setShowSubModal(true);
            }}
            onEdit={(sub) => {
              nf.setEditingSub(sub);
              nf.setShowSubModal(true);
            }}
            onToggleActive={nf.toggleSubActive}
            onDelete={nf.deleteSub}
          />
          {nf.showSubModal && (
            <SubscriptionModal
              regions={nf.regions}
              categories={nf.categories}
              editing={nf.editingSub}
              onClose={() => nf.setShowSubModal(false)}
              onSaved={() => {
                nf.setShowSubModal(false);
                nf.fetchSubscriptions();
              }}
            />
          )}
        </>
      )}

      {/* ── Tab: Deliveries ── */}
      {nf.tab === "deliveries" && (
        <NewsFeedDeliveries
          deliveries={nf.deliveries}
          loading={nf.deliveriesLoading}
          error={nf.deliveriesError}
        />
      )}
    </Stack>
  );
}
