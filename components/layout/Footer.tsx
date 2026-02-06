"use client";

import { Container, Text, Group, Box, Anchor } from "@mantine/core";
import Link from "next/link";

export function Footer() {
    return (
        <Box component="footer" mt={100} py="xl" bg="gray.0">
            <Container size="xl">
                <Group justify="space-between" align="start">
                    <Box>
                        <Text fw={700} mb="xs">광전타임즈</Text>
                        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전남 함평군 함평읍 영수길 148 2층<br />
                            등록번호: [준비중] | 발행·편집인: 선종인<br />
                            전화: 010-1234-5678 | 이메일: test@kjtimes.co.kr<br />
                            사업자등록번호: [준비중]
                        </Text>
                        <Text size="sm" c="dimmed" mt="xs">
                            Copyright © Kwangjeon Times. All rights reserved.
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
