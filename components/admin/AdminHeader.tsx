"use client";

import type { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: 20,
        marginBottom: 24,
        borderBottom: "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Stack gap={4}>
        <Title order={2} fw={700} fz={24}>
          {title}
        </Title>
        {subtitle && (
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
      {actions && <Group gap="sm">{actions}</Group>}
    </div>
  );
}
