"use client";

import { Container, Group, Text, Anchor, Box, Divider, Image, Burger, Drawer, ScrollArea, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { LINKS } from "@/constants/navigation";
import { useEffect, useState } from "react";

export function Header() {
    const [opened, { toggle }] = useDisclosure(false);
    const [today, setToday] = useState<string>("");

    useEffect(() => {
        setToday(new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        }));
    }, []);

    return (
        <Box component="header" mb="xl">
            {/* --- DESKTOP VIEW (Visible from md) --- */}
            <Box visibleFrom="md">
                {/* Top Utility Bar */}
                <Container size="xl" py="xs">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                            {today}
                        </Text>
                        <Group gap="xs">
                            <Anchor component={Link} href="/admin/login" size="xs" c="dimmed" underline="never">
                                로그인
                            </Anchor>
                            <Divider orientation="vertical" h={10} />
                            <Anchor component={Link} href="/subscribe" size="xs" c="dimmed" underline="never">
                                구독하기
                            </Anchor>
                        </Group>
                    </Group>
                </Container>

                <Divider color="gray.2" />

                {/* Logo Section */}
                <Container size="xl" py="sm">
                    <Group justify="center">
                        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Image
                                src="/brand/KJ_Logo.png"
                                style={{ height: '85px', width: 'auto', display: 'block' }}
                                alt="광전타임즈 로고"
                            />
                        </Link>
                    </Group>
                </Container>

                {/* Desktop Navigation Bar */}
                <Box style={{ borderTop: "1px solid var(--mantine-color-gray-3)", borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                    <Container size="xl">
                        <Group justify="center" gap="xl" h={50}>
                            {LINKS.map((link) => (
                                <Anchor
                                    key={link.label}
                                    component={Link}
                                    href={link.href}
                                    c="dark.9"
                                    fw={700}
                                    underline="never"
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    {link.label}
                                </Anchor>
                            ))}
                        </Group>
                    </Container>
                </Box>
            </Box>

            {/* --- MOBILE VIEW (Hidden from md) --- */}
            <Box hiddenFrom="md">
                <Container size="md" py="xs">
                    <Group justify="space-between">
                        <Burger opened={opened} onClick={toggle} size="sm" />
                        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Image
                                src="/brand/KJ_Logo.png"
                                style={{ height: '40px', width: 'auto', display: 'block' }}
                                alt="광전타임즈 로고"
                            />
                        </Link>
                        <Anchor component={Link} href="/admin/login" size="xs" c="dimmed" underline="never">
                            로그인
                        </Anchor>
                    </Group>
                </Container>
                <Divider color="gray.2" />

                {/* Mobile Horizontal Scroll Nav */}
                <ScrollArea w="100%" scrollbars="x" type="never">
                    <Group gap="lg" px="md" h={45} wrap="nowrap" style={{ whiteSpace: 'nowrap' }}>
                        {LINKS.map((link) => (
                            <Anchor
                                key={link.label}
                                component={Link}
                                href={link.href}
                                c="dark.9"
                                fw={700}
                                size="sm"
                                underline="never"
                            >
                                {link.label}
                            </Anchor>
                        ))}
                    </Group>
                </ScrollArea>
                <Divider color="gray.2" />
            </Box>

            {/* Mobile Drawer Menu */}
            <Drawer opened={opened} onClose={toggle} title="메뉴" padding="md" size="xs">
                <Stack gap="md">
                    {LINKS.map((link) => (
                        <Anchor
                            key={link.label}
                            component={Link}
                            href={link.href}
                            c="dark.9"
                            fw={700}
                            underline="never"
                            onClick={toggle}
                        >
                            {link.label}
                        </Anchor>
                    ))}
                    <Divider my="sm" />
                    <Group justify="center">
                        <Anchor component={Link} href="/subscribe" size="sm" c="dimmed" underline="never">
                            구독하기
                        </Anchor>
                    </Group>
                </Stack>
            </Drawer>
        </Box>
    );
}
