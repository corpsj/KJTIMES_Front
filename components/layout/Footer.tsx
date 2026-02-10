"use client";

import { Container, Text, Group, Box, Anchor, Stack } from "@mantine/core";
import Link from "next/link";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box component="footer" mt={100} py="xl" bg="gray.0">
            <Container size="xl">
                <Stack gap="lg" hiddenFrom="sm">
                    {/* Mobile: stacked layout */}
                    <Box>
                        <Text fw={700} mb="xs">광전타임즈</Text>
                        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전남 함평군 함평읍 영수길 148 2층<br />
                            등록번호: 전남, 아00607 | 대표: 선종인 | 발행·편집인: 장혁훈<br />
                            전화·제보: 010-9428-5361<br />
                            팩스: 0504-255-5361<br />
                            이메일: jebo@kjtimes.co.kr<br />
                            사업자등록번호: 173-91-02454
                        </Text>
                    </Box>
                    <Group gap="md" wrap="wrap">
                        <Anchor component={Link} href="/about" size="sm" c="dimmed" underline="never">
                            회사소개
                        </Anchor>
                        <Anchor component={Link} href="/advertise" size="sm" c="dimmed" underline="never">
                            광고안내
                        </Anchor>
                        <Anchor component={Link} href="/privacy" size="sm" c="dimmed" underline="never">
                            개인정보처리방침
                        </Anchor>
                        <Anchor component={Link} href="/editorial" size="sm" c="dimmed" underline="never">
                            편집원칙
                        </Anchor>
                        <Anchor component={Link} href="/corrections" size="sm" c="dimmed" underline="never">
                            정정보도/오류신고
                        </Anchor>
                    </Group>
                    <Text size="sm" c="dimmed">
                        Copyright © {year} 광전타임즈. All rights reserved.
                    </Text>
                </Stack>

                <Group justify="space-between" align="start" visibleFrom="sm">
                    {/* Desktop: side-by-side layout */}
                    <Box>
                        <Text fw={700} mb="xs">광전타임즈</Text>
                        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전남 함평군 함평읍 영수길 148 2층<br />
                            등록번호: 전남, 아00607 | 대표: 선종인 | 발행·편집인: 장혁훈<br />
                            전화·제보: 010-9428-5361 | 팩스: 0504-255-5361 | 이메일: jebo@kjtimes.co.kr<br />
                            사업자등록번호: 173-91-02454
                        </Text>
                        <Text size="sm" c="dimmed" mt="xs">
                            Copyright © {year} 광전타임즈. All rights reserved.
                        </Text>
                    </Box>
                    <Group gap="lg" wrap="wrap">
                        <Anchor component={Link} href="/about" size="sm" c="dimmed" underline="never">
                            회사소개
                        </Anchor>
                        <Anchor component={Link} href="/advertise" size="sm" c="dimmed" underline="never">
                            광고안내
                        </Anchor>
                        <Anchor component={Link} href="/privacy" size="sm" c="dimmed" underline="never">
                            개인정보처리방침
                        </Anchor>
                        <Anchor component={Link} href="/editorial" size="sm" c="dimmed" underline="never">
                            편집원칙
                        </Anchor>
                        <Anchor component={Link} href="/corrections" size="sm" c="dimmed" underline="never">
                            정정보도/오류신고
                        </Anchor>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
}
