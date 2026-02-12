"use client";

import Link from "next/link";
import {
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArticle,
  IconCheck,
  IconFileText,
  IconPlus,
  IconSend,
} from "@tabler/icons-react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import ArticlesFilterBar from "@/components/admin/articles/ArticlesFilterBar";
import ArticlesBatchBar from "@/components/admin/articles/ArticlesBatchBar";
import ArticlesTable from "@/components/admin/articles/ArticlesTable";
import { useArticles } from "@/hooks/useArticles";

export default function AdminArticles() {
  const a = useArticles();

  return (
    <Stack gap="lg">
      {/* Header */}
      <AdminHeader
        title="기사 관리"
        subtitle={`총 ${a.totalCount.toLocaleString()}건의 기사`}
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
          value={a.statsTotal}
          icon={<IconArticle size={22} />}
          color="blue"
        />
        <StatCard
          label="게시"
          value={a.statsPublished}
          icon={<IconCheck size={22} />}
          color="green"
        />
        <StatCard
          label="작성"
          value={a.statsDraft}
          icon={<IconFileText size={22} />}
          color="gray"
        />
        <StatCard
          label="승인 대기"
          value={a.statsPending}
          icon={<IconSend size={22} />}
          color="yellow"
        />
      </SimpleGrid>

      {/* Filter Bar */}
      <ArticlesFilterBar
        searchTerm={a.searchTerm}
        onSearchChange={(v) => {
          a.setSearchTerm(v);
        }}
        onSearchSubmit={() => {
          a.setPage(1);
          a.triggerRefresh();
        }}
        statusFilter={a.statusFilter}
        onStatusChange={(v) => {
          a.setStatusFilter(v);
          a.setPage(1);
        }}
        sortFilter={a.sortFilter}
        onSortChange={(v) => {
          a.setSortFilter(v);
          a.setPage(1);
        }}
        hasActiveFilters={a.hasActiveFilters}
        onReset={a.resetFilters}
        bulkLoading={a.bulkLoading}
      />

      {/* Batch Operations Bar */}
      <ArticlesBatchBar
        selectedCount={a.selectedCount}
        bulkStatusTarget={a.bulkStatusTarget}
        onBulkStatusChange={a.setBulkStatusTarget}
        onApplyBulkStatus={a.applyBulkStatus}
        onDeleteSelected={a.deleteSelectedArticles}
        onClearSelection={() => a.setSelectedArticleIds([])}
        bulkLoading={a.bulkLoading}
      />

      {/* Article Table */}
      <ArticlesTable
        articles={a.articles}
        loading={a.loading}
        hasActiveFilters={a.hasActiveFilters}
        allVisibleSelected={a.allVisibleSelected}
        selectedArticleIds={a.selectedArticleIds}
        actionLoadingId={a.actionLoadingId}
        bulkLoading={a.bulkLoading}
        totalCount={a.totalCount}
        totalPages={a.totalPages}
        page={a.page}
        onPageChange={a.setPage}
        onToggleSelectAll={a.toggleSelectAllVisible}
        onToggleArticle={a.toggleArticleSelection}
        onUpdateStatus={a.updateStatus}
        onShare={a.handleShareAction}
        onClone={a.cloneArticle}
        onDelete={a.setDeleteModalArticle}
        onResetFilters={a.resetFilters}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!a.deleteModalArticle}
        onClose={() => a.setDeleteModalArticle(null)}
        title="기사 삭제"
        centered
        size="sm"
      >
        {a.deleteModalArticle && (
          <Stack gap="md">
            <Text size="sm">
              &ldquo;{a.deleteModalArticle.title}&rdquo;
            </Text>
            <Text size="sm" c="dimmed">
              이 기사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </Text>
            <Group justify="flex-end" gap="sm">
              <Button
                variant="default"
                onClick={() => a.setDeleteModalArticle(null)}
              >
                취소
              </Button>
              <Button
                color="red"
                onClick={() =>
                  void a.confirmDeleteArticle(a.deleteModalArticle!)
                }
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
