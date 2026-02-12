"use client";

import {
    Container,
    Group,
    Burger,
    Image,
    Drawer,
    Stack,
    Anchor,
    Divider,
    ScrollArea,
    Box,
    TextInput,
    Button,
    Text,
    ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LINKS } from "@/constants/navigation";

export function MobileHeader() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const pathname = usePathname();

    // Determine which category is active based on pathname
    const isActiveLink = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <>
            {/* Top bar */}
            <Box
                component="header"
                style={{
                    borderBottom: "1px solid var(--mantine-color-newsMuted-1)",
                    background: "var(--mantine-color-newsSurface-0)",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Container size="md" py="xs">
                    <Group justify="space-between" align="center">
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            size="sm"
                            aria-label="메뉴 열기"
                        />
                        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                            <Image
                                src="/brand/KJ_sloganLogo.png"
                                style={{ height: "35px", width: "auto", display: "block" }}
                                alt="광전타임즈"
                            />
                        </Link>
                        <Group gap={6} wrap="nowrap">
                            <ActionIcon
                                component={Link}
                                href="/search"
                                variant="subtle"
                                color="gray"
                                size="sm"
                                aria-label="검색"
                            >
                                <IconSearch size={18} />
                            </ActionIcon>
                            <Anchor
                                component={Link}
                                href="/admin/login"
                                size="xs"
                                c="dimmed"
                                underline="never"
                            >
                                로그인
                            </Anchor>
                        </Group>
                    </Group>
                </Container>

                {/* Horizontal scrollable category nav */}
                <ScrollArea
                    w="100%"
                    scrollbars="x"
                    type="never"
                    style={{ borderTop: "1px solid var(--mantine-color-newsBorder-0)" }}
                >
                    <Group gap="lg" px="md" h={42} wrap="nowrap" style={{ whiteSpace: "nowrap" }}>
                        {LINKS.map((link) => {
                            const active = isActiveLink(link.href);
                            return (
                                <Anchor
                                    key={link.label}
                                    component={Link}
                                    href={link.href}
                                    c={active ? "blue.7" : "dark.9"}
                                    fw={active ? 800 : 600}
                                    size="sm"
                                    underline="never"
                                    style={{
                                        transition: "color 0.15s ease",
                                        flexShrink: 0,
                                        borderBottom: active ? "2px solid var(--mantine-color-blue-7)" : "2px solid transparent",
                                        paddingBottom: 2,
                                    }}
                                >
                                    {link.label}
                                </Anchor>
                            );
                        })}
                    </Group>
                </ScrollArea>
            </Box>

            {/* Drawer menu */}
            <Drawer
                opened={opened}
                onClose={close}
                title={
                    <Group gap="xs">
                        <Image
                            src="/brand/KJ_sloganLogo.png"
                            style={{ height: "28px", width: "auto" }}
                            alt="광전타임즈"
                        />
                    </Group>
                }
                padding="md"
                size="80%"
                styles={{
                    header: { borderBottom: "1px solid var(--mantine-color-newsMuted-1)", paddingBottom: 12 },
                    body: { paddingTop: 16 },
                }}
            >
                {/* Search */}
                <Box component="form" action="/search" method="get" mb="lg">
                    <Group gap="xs" wrap="nowrap">
                        <TextInput
                            name="q"
                            placeholder="기사 검색..."
                            size="sm"
                            aria-label="검색어"
                            leftSection={<IconSearch size={16} />}
                            style={{ flex: 1 }}
                            styles={{
                                input: {
                                    borderColor: "var(--mantine-color-newsHeadline-2)",
                                    "&:focus": { borderColor: "var(--mantine-color-newsAccent-6)" },
                                },
                            }}
                        />
                        <Button type="submit" size="sm" variant="filled" color="dark">
                            검색
                        </Button>
                    </Group>
                </Box>

                {/* Category links */}
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: "0.05em" }}>
                    카테고리
                </Text>
                <Stack gap="sm">
                    {LINKS.map((link) => {
                        const active = isActiveLink(link.href);
                        return (
                            <Anchor
                                key={link.label}
                                component={Link}
                                href={link.href}
                                c={active ? "blue.7" : "dark.9"}
                                fw={active ? 800 : 600}
                                underline="never"
                                onClick={close}
                                size="md"
                                py={4}
                                style={{
                                    borderBottom: "1px solid var(--mantine-color-newsBorder-0)",
                                    display: "block",
                                    transition: "color 0.15s ease",
                                    borderLeft: active ? "3px solid var(--mantine-color-blue-7)" : "3px solid transparent",
                                    paddingLeft: 8,
                                }}
                            >
                                {link.label}
                            </Anchor>
                        );
                    })}
                </Stack>

                <Divider my="lg" />

                {/* Utility links */}
                <Stack gap="sm">
                    <Anchor
                        component={Link}
                        href="/subscribe"
                        size="md"
                        c="blue"
                        fw={700}
                        underline="never"
                        onClick={close}
                    >
                        구독하기
                    </Anchor>
                    <Anchor
                        component={Link}
                        href="/about"
                        size="sm"
                        c="dimmed"
                        underline="never"
                        onClick={close}
                    >
                        회사소개
                    </Anchor>
                    <Anchor
                        component={Link}
                        href="/advertise"
                        size="sm"
                        c="dimmed"
                        underline="never"
                        onClick={close}
                    >
                        광고안내
                    </Anchor>
                </Stack>
            </Drawer>
        </>
    );
}
