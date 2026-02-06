"use client";

import { Container, Text, Stack, Box, Group, Anchor } from "@mantine/core";
import Link from "next/link";

export function MobileFooter() {
    return (
        <Box component="footer" py="xl" bg="gray.1" mt="xl">
            <Container size="md">
                <Stack gap="xs" align="center">
                    <Text fw={700}>광전타임즈 (모바일)</Text>
                    <Text size="xs" c="dimmed" ta="center">
                        전남 함평군 함평읍 영수길 148 2층<br />
                        발행인: 선종인 | 전화: 010-1234-5678
                    </Text>
                    <Group gap="md" justify="center" wrap="wrap">
                        <Anchor component={Link} href="/about" size="xs" c="dimmed" underline="never">
                            회사소개
                        </Anchor>
                        <Anchor component={Link} href="/advertise" size="xs" c="dimmed" underline="never">
                            광고안내
                        </Anchor>
                        <Anchor component={Link} href="/privacy" size="xs" c="dimmed" underline="never">
                            개인정보처리방침
                        </Anchor>
                        <Anchor component={Link} href="/editorial" size="xs" c="dimmed" underline="never">
                            편집원칙
                        </Anchor>
                        <Anchor component={Link} href="/corrections" size="xs" c="dimmed" underline="never">
                            정정보도
                        </Anchor>
                    </Group>
                    <Text size="xs" c="dimmed" mt="xs">
                        © Kwangjeon Times. All rights reserved.
                    </Text>
                </Stack>
            </Container>
        </Box>
    );
}
