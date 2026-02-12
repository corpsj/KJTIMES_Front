"use client";

import { SegmentedControl } from "@mantine/core";

interface FilterSortProps {
  sortBy: "latest" | "popular";
  onSortChange: (value: "latest" | "popular") => void;
}

export function FilterSort({ sortBy, onSortChange }: FilterSortProps) {
  return (
    <SegmentedControl
      value={sortBy}
      onChange={(value) => onSortChange(value as "latest" | "popular")}
      data={[
        { label: "최신순", value: "latest" },
        { label: "인기순", value: "popular" },
      ]}
      fullWidth={false}
    />
  );
}
