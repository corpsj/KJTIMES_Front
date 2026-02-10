"use client";

import type { ReactNode } from "react";
import { Stack, Text } from "@mantine/core";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="md" py={60}>
      <div style={{ color: "#adb5bd", fontSize: 48, lineHeight: 1 }}>{icon}</div>
      <Text fw={600} fz="lg" c="dimmed">
        {title}
      </Text>
      {description && (
        <Text size="sm" c="dimmed" maw={400} ta="center">
          {description}
        </Text>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </Stack>
  );
}
