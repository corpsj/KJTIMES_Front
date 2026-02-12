"use client";

import { SegmentedControl } from "@mantine/core";

interface SearchSortProps {
  sortBy: "relevance" | "latest";
  onSortChange: (value: "relevance" | "latest") => void;
}

export function SearchSort({ sortBy, onSortChange }: SearchSortProps) {
  return (
    <SegmentedControl
      value={sortBy}
      onChange={(value) => onSortChange(value as "relevance" | "latest")}
      data={[
        { label: "관련순", value: "relevance" },
        { label: "최신순", value: "latest" },
      ]}
      size="sm"
    />
  );
}
