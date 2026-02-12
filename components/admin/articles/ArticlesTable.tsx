"use client";

import Link from "next/link";
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Menu,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import {
  IconCopy,
  IconDots,
  IconEdit,
  IconLink,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { IconArticle } from "@tabler/icons-react";
import type { ArticleRow } from "@/hooks/useArticles";
import {
  getCategoryName,
  isSpecialIssueArticle,
  inlineStatusOptions,
  PAGE_SIZE,
} from "@/hooks/useArticles";

interface ArticlesTableProps {
  articles: ArticleRow[];
  loading: boolean;
  hasActiveFilters: boolean;
  allVisibleSelected: boolean;
  selectedArticleIds: string[];
  actionLoadingId: string | null;
  bulkLoading: boolean;
  totalCount: number;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleArticle: (articleId: string, checked: boolean) => void;
  onUpdateStatus: (article: ArticleRow, status: string) => void;
  onShare: (article: ArticleRow) => void;
  onClone: (article: ArticleRow) => void;
  onDelete: (article: ArticleRow) => void;
  onResetFilters: () => void;
}

export default function ArticlesTable({
  articles,
  loading,
  hasActiveFilters,
  allVisibleSelected,
  selectedArticleIds,
  actionLoadingId,
  bulkLoading,
  totalCount,
  totalPages,
  page,
  onPageChange,
  onToggleSelectAll,
  onToggleArticle,
  onUpdateStatus,
  onShare,
  onClone,
  onDelete,
  onResetFilters,
}: ArticlesTableProps) {
  return (
    <Paper
      shadow="0 1px 3px rgba(0,0,0,0.08)"
      style={{ border: "1px solid #f1f3f5", overflow: "hidden" }}
    >
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
          description={
            hasActiveFilters
              ? "필터 조건에 맞는 기사가 없습니다."
              : "새 기사를 작성해 보세요."
          }
          action={
            hasActiveFilters ? (
              <Button variant="light" onClick={onResetFilters}>
                필터 초기화
              </Button>
            ) : (
              <Button
                component={Link}
                href="/admin/write"
                leftSection={<IconPlus size={16} />}
              >
                새 기사 작성
              </Button>
            )
          }
        />
      ) : (
        <Table.ScrollContainer minWidth={800}>
          <Table
            verticalSpacing="sm"
            horizontalSpacing="md"
            striped
            highlightOnHover
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}>
                  <Checkbox
                    checked={allVisibleSelected}
                    onChange={(e) =>
                      onToggleSelectAll(e.currentTarget.checked)
                    }
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
                const isSelected = selectedArticleIds.includes(
                  article.id
                );
                const isSpecialIssue = isSpecialIssueArticle(article);
                const canShare = Boolean(
                  article.slug &&
                    (article.status === "shared" ||
                      article.status === "published")
                );

                return (
                  <Table.Tr
                    key={article.id}
                    style={{
                      opacity:
                        actionLoadingId === article.id ? 0.5 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <Table.Td>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) =>
                          onToggleArticle(
                            article.id,
                            e.currentTarget.checked
                          )
                        }
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
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            {article.title}
                          </Text>
                        </Group>
                        <Group gap={6}>
                          <Badge
                            variant="outline"
                            size="xs"
                            color="gray"
                          >
                            {getCategoryName(article.categories)}
                          </Badge>
                          {isSpecialIssue && (
                            <Badge
                              variant="light"
                              size="xs"
                              color="violet"
                            >
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
                        {new Date(
                          article.updated_at || article.created_at
                        ).toLocaleDateString("ko-KR")}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="xs" c="dimmed">
                        {article.views?.toLocaleString() || 0}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu
                        shadow="md"
                        width={160}
                        position="bottom-end"
                      >
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                          >
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
                              onClick={() => void onShare(article)}
                            >
                              공유
                            </Menu.Item>
                          )}
                          <Menu.Item
                            leftSection={<IconCopy size={14} />}
                            onClick={() => void onClone(article)}
                            disabled={
                              actionLoadingId === article.id ||
                              bulkLoading
                            }
                          >
                            복제
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Label>상태 변경</Menu.Label>
                          {inlineStatusOptions.map((opt) => (
                            <Menu.Item
                              key={opt.value}
                              disabled={
                                article.status === opt.value ||
                                actionLoadingId === article.id
                              }
                              onClick={() =>
                                void onUpdateStatus(
                                  article,
                                  opt.value
                                )
                              }
                              fz="xs"
                            >
                              {opt.label}
                            </Menu.Item>
                          ))}
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => onDelete(article)}
                            disabled={
                              actionLoadingId === article.id ||
                              bulkLoading
                            }
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
        <Group
          justify="center"
          py="md"
          style={{ borderTop: "1px solid #f1f3f5" }}
        >
          <Pagination
            total={totalPages}
            value={page}
            onChange={onPageChange}
            size="sm"
          />
        </Group>
      )}
    </Paper>
  );
}
