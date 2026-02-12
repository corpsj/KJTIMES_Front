"use client";

import { Badge, Button, Group, Paper, Select } from "@mantine/core";
import { bulkStatusOptions } from "@/hooks/useArticles";

interface ArticlesBatchBarProps {
  selectedCount: number;
  bulkStatusTarget: string;
  onBulkStatusChange: (value: string) => void;
  onApplyBulkStatus: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  bulkLoading: boolean;
}

export default function ArticlesBatchBar({
  selectedCount,
  bulkStatusTarget,
  onBulkStatusChange,
  onApplyBulkStatus,
  onDeleteSelected,
  onClearSelection,
  bulkLoading,
}: ArticlesBatchBarProps) {
  if (selectedCount === 0) return null;

  return (
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
            data={bulkStatusOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            value={bulkStatusTarget}
            onChange={(val) => onBulkStatusChange(val || "pending_review")}
            w={140}
            clearable={false}
          />
          <Button
            size="xs"
            variant="light"
            onClick={onApplyBulkStatus}
            disabled={bulkLoading}
          >
            상태 변경
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={onDeleteSelected}
            disabled={bulkLoading}
          >
            삭제
          </Button>
        </Group>
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          onClick={onClearSelection}
        >
          선택 해제
        </Button>
      </Group>
    </Paper>
  );
}
