"use client";

import { Group, Paper, Select, TextInput } from "@mantine/core";
import type { NfRegion, NfCategory } from "@/hooks/useNewsFeed";

interface NewsFeedFiltersProps {
  regions: NfRegion[];
  categories: NfCategory[];
  filterRegion: string;
  setFilterRegion: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterKeyword: string;
  setFilterKeyword: (v: string) => void;
  filterFrom: string;
  setFilterFrom: (v: string) => void;
  filterTo: string;
  setFilterTo: (v: string) => void;
}

export default function NewsFeedFilters({
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
}: NewsFeedFiltersProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group gap="md" align="flex-end" wrap="wrap">
        {regions.length > 0 && (
          <Select
            label="지역"
            placeholder="전체"
            data={[
              { value: "", label: "전체" },
              ...regions.map((r) => ({ value: r.code, label: r.name })),
            ]}
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
            data={[
              { value: "", label: "전체" },
              ...categories.map((c) => ({ value: c.code, label: c.name })),
            ]}
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
  );
}
