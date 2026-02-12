"use client";

import { Container, Text, Stack, Box, Group, Anchor, Divider, Image } from "@mantine/core";
import Link from "next/link";
import { LINKS } from "@/constants/navigation";

export function MobileFooter() {
    const categoryLinks = LINKS.filter((link) => link.href !== "/");
    const year = new Date().getFullYear();

    return (
        <Box component="footer" py="xl" mt="xl" style={{ borderTop: "1px solid var(--mantine-color-newsMuted-1)", background: "var(--mantine-color-newsMuted-0)" }}>
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

                    <Divider color="newsMuted.1" />

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
                            정정보도/오류신고
                        </Anchor>
                    </Group>

                    {/* Company info — matches desktop Footer exactly */}
                    <Stack gap={4}>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            광전타임즈 | 대표: 선종인 | 발행·편집인: 장혁훈
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전남 함평군 함평읍 영수길 148 2층
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            등록번호: 전남, 아00607
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전화·제보: 010-9428-5361
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            팩스: 0504-255-5361
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            이메일: jebo@kjtimes.co.kr
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                            사업자등록번호: 173-91-02454
                        </Text>
                    </Stack>

                    <Text size="xs" c="dimmed" style={{ opacity: 0.7 }}>
                        Copyright © {year} 광전타임즈. All rights reserved.
                    </Text>
                </Stack>
            </Container>
        </Box>
    );
}
