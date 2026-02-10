"use client";

import { Container, Title, Text, Button, Stack, Image } from "@mantine/core";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <Container size="sm" py={80}>
            <Stack align="center" gap="lg">
                <Image
                    src="/brand/KJ_sloganLogo.png"
                    alt="광전타임즈 로고"
                    w={220}
                    fit="contain"
                />
                <Title order={2} ta="center" size="h3">
                    오류가 발생했습니다
                </Title>
                <Text c="dimmed" ta="center" size="md">
                    일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
                </Text>
                {process.env.NODE_ENV === "development" && error?.message && (
                    <Text size="xs" c="red" ta="center" style={{ wordBreak: "break-all" }}>
                        {error.message}
                    </Text>
                )}
                <Button onClick={reset} variant="filled" size="md">
                    다시 시도
                </Button>
            </Stack>
        </Container>
    );
}
