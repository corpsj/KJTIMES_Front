"use client";

import { Container, Group, Text, Anchor, Box, Divider, Image, TextInput, Button } from "@mantine/core";
import Link from "next/link";
import { LINKS } from "@/constants/navigation";

export function Header() {
    const today = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        timeZone: "Asia/Seoul",
    }).format(new Date());

    return (
        <Box component="header" mb="xl">
            {/* --- DESKTOP VIEW (Visible from md) --- */}
            <Box visibleFrom="md">
                {/* Top Utility Bar */}
                <Container size="xl" py="xs">
                    <Group justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                            {today}
                        </Text>
                        <Box
                            component="form"
                            action="/search"
                            method="get"
                            style={{ flex: 1, maxWidth: 360 }}
                        >
                            <Group gap="xs" wrap="nowrap">
                                <TextInput
                                    name="q"
                                    placeholder="검색어를 입력하세요"
                                    size="xs"
                                    aria-label="검색어"
                                    style={{ flex: 1 }}
                                />
                                <Button type="submit" size="xs" variant="light">
                                    검색
                                </Button>
                            </Group>
                        </Box>
                        <Group gap="xs">
                            <Anchor component={Link} href="/login" size="xs" c="dimmed" underline="never">
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
                                src="/brand/KJ_sloganLogo.png"
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

        </Box>
    );
}
