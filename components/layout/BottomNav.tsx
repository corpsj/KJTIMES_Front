"use client";

import { Box, Group, Text } from "@mantine/core";
import { IconHome, IconCategory, IconSearch, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "홈", href: "/", icon: IconHome },
  { label: "카테고리", href: "/politics", icon: IconCategory },
  { label: "검색", href: "/search", icon: IconSearch },
  { label: "최신", href: "/society", icon: IconClock },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <Box
      hiddenFrom="md"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "var(--mantine-color-white)",
        borderTop: "1px solid var(--mantine-color-gray-2)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Group justify="space-around" h={56} wrap="nowrap">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Box
              key={tab.href}
              component={Link}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                flex: 1,
                textDecoration: "none",
                color: active
                  ? "var(--mantine-color-blue-7)"
                  : "var(--mantine-color-gray-6)",
                transition: "color 150ms ease",
                minHeight: 48,
              }}
            >
              <tab.icon size={22} stroke={active ? 2.2 : 1.5} />
              <Text size="xs" fw={active ? 700 : 400} lh={1}>
                {tab.label}
              </Text>
            </Box>
          );
        })}
      </Group>
    </Box>
  );
}
