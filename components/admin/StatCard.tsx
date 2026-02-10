"use client";

import type { ReactNode } from "react";
import { Group, Paper, Text, ThemeIcon } from "@mantine/core";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
}

export default function StatCard({ label, value, icon, color = "blue" }: StatCardProps) {
  return (
    <Paper
      p="md"
      shadow="0 1px 3px rgba(0,0,0,0.08)"
      style={{ border: "1px solid #f1f3f5" }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text fw={700} fz={28} mt={4} lh={1.2}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
        </div>
        <ThemeIcon variant="light" color={color} size={44} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
