"use client";

import { Button, Group, Paper, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { statusOptions, sortOptions } from "@/hooks/useArticles";

interface ArticlesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortFilter: string;
  onSortChange: (value: string) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
  bulkLoading: boolean;
}

export default function ArticlesFilterBar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusChange,
  sortFilter,
  onSortChange,
  hasActiveFilters,
  onReset,
  bulkLoading,
}: ArticlesFilterBarProps) {
  return (
    <Paper
      p="md"
      shadow="0 1px 3px rgba(0,0,0,0.08)"
      style={{ border: "1px solid var(--mantine-color-gray-1)" }}
    >
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="제목 또는 슬러그 검색"
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit();
          }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          placeholder="상태"
          data={statusOptions.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          value={statusFilter}
          onChange={(val) => onStatusChange(val || "all")}
          w={140}
          clearable={false}
        />
        <Select
          placeholder="정렬"
          data={sortOptions.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          value={sortFilter}
          onChange={(val) => onSortChange(val || "latest")}
          w={130}
          clearable={false}
        />
        {hasActiveFilters && (
          <Button
            variant="subtle"
            color="gray"
            onClick={onReset}
            disabled={bulkLoading}
          >
            초기화
          </Button>
        )}
      </Group>
    </Paper>
  );
}
