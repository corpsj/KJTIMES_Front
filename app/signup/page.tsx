import { Container, Paper, Stack, Text, Image } from "@mantine/core";
import Link from "next/link";

export default function SignupPage() {
    return (
        <Container size={420} my={60}>
            <Stack align="center" mb={30}>
                <Image
                    src="/brand/KJ_sloganLogo.png"
                    alt="광전타임즈 로고"
                    w={280}
                    fit="contain"
                />
            </Stack>

            <Paper withBorder shadow="md" p={30} radius="md">
                <Stack align="center" gap="md">
                    <Text fw={600} size="lg">
                        회원가입 안내
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                        관리자 문의가 필요합니다.
                    </Text>
                    <Text c="dimmed" size="xs" ta="center">
                        계정 생성은 관리자 승인이 필요합니다.<br />
                        아래 연락처로 문의해 주세요.
                    </Text>
                    <Text size="sm" ta="center" fw={500}>
                        이메일: jebo@kjtimes.co.kr<br />
                        전화: 010-9428-5361
                    </Text>
                </Stack>
            </Paper>

            <Link
                href="/admin/login"
                style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    padding: "10px 0",
                    marginTop: 24,
                    border: "1px solid #dee2e6",
                    borderRadius: 8,
                    color: "#1a1b1e",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                }}
            >
                로그인 페이지로 돌아가기
            </Link>
        </Container>
    );
}
