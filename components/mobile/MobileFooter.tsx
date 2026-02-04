"use client";

import { Container, Text, Stack, Box } from "@mantine/core";

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
                    <Text size="xs" c="dimmed" mt="xs">
                        © Kwangjeon Times. All rights reserved.
                    </Text>
                </Stack>
            </Container>
        </Box>
    );
}
