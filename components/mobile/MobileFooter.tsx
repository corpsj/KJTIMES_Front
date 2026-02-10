"use client";

import { Container, Text, Stack, Box, Group, Anchor, Divider, Image } from "@mantine/core";
import Link from "next/link";
import { LINKS } from "@/constants/navigation";

export function MobileFooter() {
    const categoryLinks = LINKS.filter((link) => link.href !== "/");

    return (
        <Box component="footer" py="xl" mt="xl" style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <Container size="md">
                <Stack gap="lg">
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
                        <Image
                            src="/brand/KJ_sloganLogo.png"
                            style={{ height: "30px", width: "auto", opacity: 0.7 }}
                            alt="광전타임즈"
                        />
                    </Link>

                    {/* Category links */}
                    <Group gap="sm" wrap="wrap">
                        {categoryLinks.map((link) => (
                            <Anchor
                                key={link.href}
                                component={Link}
                                href={link.href}
                                size="xs"
                                c="dark.6"
                                fw={600}
                                underline="never"
                            >
                                {link.label}
                            </Anchor>
                        ))}
                    </Group>

                    <Divider color="#e2e8f0" />

                    {/* Info links */}
                    <Group gap="md" wrap="wrap">
                        <Anchor component={Link} href="/about" size="xs" c="dimmed" underline="never">
                            회사소개
                        </Anchor>
                        <Anchor component={Link} href="/advertise" size="xs" c="dimmed" underline="never">
                            광고안내
                        </Anchor>
                        <Anchor component={Link} href="/privacy" size="xs" c="dimmed" underline="never" fw={700}>
                            개인정보처리방침
                        </Anchor>
                        <Anchor component={Link} href="/editorial" size="xs" c="dimmed" underline="never">
                            편집원칙
                        </Anchor>
                        <Anchor component={Link} href="/corrections" size="xs" c="dimmed" underline="never">
                            정정보도
                        </Anchor>
                    </Group>

                    {/* Company info */}
                    <Stack gap={4}>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            광전타임즈 | 발행인: 선종인
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전남 함평군 함평읍 영수길 148 2층
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전화: 010-1234-5678 | 이메일: contact@kjtimes.co.kr
                        </Text>
                    </Stack>

                    <Text size="xs" c="dimmed" style={{ opacity: 0.7 }}>
                        © {new Date().getFullYear()} Kwangjeon Times. All rights reserved.
                    </Text>
                </Stack>
            </Container>
        </Box>
    );
}
