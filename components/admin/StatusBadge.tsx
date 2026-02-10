"use client";

import { Badge } from "@mantine/core";

const statusConfig: Record<string, { color: string; label: string }> = {
  published: { color: "green", label: "게시" },
  shared: { color: "blue", label: "공유" },
  pending_review: { color: "yellow", label: "승인대기" },
  draft: { color: "gray", label: "작성" },
  rejected: { color: "red", label: "반려" },
  archived: { color: "dimmed", label: "보관" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: "gray", label: status };

  return (
    <Badge
      variant="light"
      color={config.color}
      size="sm"
      radius="sm"
    >
      {config.label}
    </Badge>
  );
}
