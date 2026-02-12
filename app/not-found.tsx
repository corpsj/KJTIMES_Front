import { Container, Title, Text, Stack, Image, Group } from "@mantine/core";
import Link from "next/link";

export default function NotFound() {
    return (
        <Container size="sm" py={80}>
            <Stack align="center" gap="lg">
                <Image
                    src="/brand/KJ_sloganLogo.png"
                    alt="광전타임즈 로고"
                    w={220}
                    fit="contain"
                />
                <Title order={1} ta="center" style={{ fontSize: "4rem", color: "var(--mantine-color-gray-3)" }}>
                    404
                </Title>
                <Title order={2} ta="center" size="h3">
                    페이지를 찾을 수 없습니다
                </Title>
                <Text c="dimmed" ta="center" size="md">
                    요청하신 페이지가 존재하지 않거나, 삭제되었거나, 주소가 변경되었을 수 있습니다.
                </Text>
                <Group gap="md">
                    <Link
                        href="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 20px",
                            borderRadius: 8,
                            background: "var(--mantine-color-blue-6)",
                            color: "var(--mantine-color-white)",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                        }}
                    >
                        홈으로 돌아가기
                    </Link>
                    <Link
                        href="/search"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 20px",
                            borderRadius: 8,
                            background: "var(--mantine-color-blue-0)",
                            color: "var(--mantine-color-blue-6)",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                        }}
                    >
                        기사 검색
                    </Link>
                </Group>
            </Stack>
        </Container>
    );
}
