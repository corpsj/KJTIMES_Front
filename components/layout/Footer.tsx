"use client";

import { Container, Text, Group, Box, Divider } from "@mantine/core";

export function Footer() {
    return (
        <Box component="footer" mt={100} py="xl" bg="gray.0">
            <Container size="xl">
                <Group justify="space-between" align="start">
                    <Box>
                        <Text fw={700} mb="xs">광전타임즈</Text>
                        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                            전남 함평군 함평읍 영수길 148 2층<br />
                            등록번호: [전남, 아00000] | 발행·편집인: [이름]<br />
                            전화: 061-000-0000 | 팩스: 061-000-0000 | 이메일: email@kjtimes.co.kr<br />
                            사업자등록번호: 000-00-00000
                        </Text>
                        <Text size="sm" c="dimmed" mt="xs">
                            Copyright © Kwangjeon Times. All rights reserved.
                        </Text>
                    </Box>
                    <Group gap="lg">
                        <Text size="sm" c="dimmed">회사소개</Text>
                        <Text size="sm" c="dimmed">광고안내</Text>
                        <Text size="sm" c="dimmed">개인정보처리방침</Text>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
}
