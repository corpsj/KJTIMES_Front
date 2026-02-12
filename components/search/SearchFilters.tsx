"use client";

import { Paper, Stack, Title, Select, Group, Button, Text } from "@mantine/core";
import { IconFilter, IconX } from "@tabler/icons-react";

interface SearchFiltersProps {
  categoryFilter: string;
  dateFilter: string;
  onCategoryChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체 카테고리" },
  { value: "politics", label: "정치" },
  { value: "economy", label: "경제" },
  { value: "society", label: "사회" },
  { value: "culture", label: "문화" },
  { value: "sports", label: "스포츠" },
  { value: "opinion", label: "오피니언" },
];

const DATE_OPTIONS = [
  { value: "all", label: "전체 기간" },
  { value: "today", label: "오늘" },
  { value: "week", label: "최근 1주일" },
  { value: "month", label: "최근 1개월" },
  { value: "3months", label: "최근 3개월" },
  { value: "year", label: "최근 1년" },
];

export function SearchFilters({
  categoryFilter,
  dateFilter,
  onCategoryChange,
  onDateChange,
  onClearFilters,
  hasActiveFilters,
}: SearchFiltersProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconFilter size={18} />
            <Title order={4} size="h5">
              필터
            </Title>
          </Group>
          {hasActiveFilters && (
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={onClearFilters}
            >
              초기화
            </Button>
          )}
        </Group>

        <Stack gap="sm">
          <div>
            <Text size="sm" fw={500} mb={4}>
              카테고리
            </Text>
            <Select
              data={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={(value) => onCategoryChange(value || "all")}
              placeholder="카테고리 선택"
              clearable={false}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>
              기간
            </Text>
            <Select
              data={DATE_OPTIONS}
              value={dateFilter}
              onChange={(value) => onDateChange(value || "all")}
              placeholder="기간 선택"
              clearable={false}
            />
          </div>
        </Stack>

        {hasActiveFilters && (
          <Text size="xs" c="dimmed">
            {categoryFilter !== "all" && `카테고리: ${CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label}`}
            {categoryFilter !== "all" && dateFilter !== "all" && " · "}
            {dateFilter !== "all" && `기간: ${DATE_OPTIONS.find((d) => d.value === dateFilter)?.label}`}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
