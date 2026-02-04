"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Button, Paper, Title, Container, Stack, Alert, Anchor, Text, Image } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function SignupPage() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async () => {
        if (!id || !password || !name) {
            setError("모든 필드를 입력해주세요.");
            return;
        }

        // Validate ID format (alphanumeric only)
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            setError("아이디는 영문과 숫자만 가능합니다.");
            return;
        }

        setLoading(true);
        setError(null);

        // Use a placeholder domain for ID-based login
        const email = `${id}@kwangjeon.local`;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    username: id, // Store actual ID in metadata
                },
            },
        });

        if (error) {
            let message = error.message;
            if (message.includes("Email signups are disabled")) {
                message = "관리자 설정에 의해 회원가입이 비활성화되어 있습니다. (Supabase Auth 설정을 확인하세요)";
            } else if (message.includes("User already registered")) {
                message = "이미 등록된 아이디입니다.";
            }
            setError(message);
            setLoading(false);
        } else {
            // Check if session exists (auto-signin)
            if (data.session) {
                alert("회원가입이 완료되었습니다.");
                router.push("/admin");
            } else {
                // If email confirmation is enabled in Supabase, session might be null
                // But since we are using fake emails, we assume confirmation is OFF or handled.
                // Alerting user just in case.
                setError("회원가입 요청이 전송되었습니다. 이메일 인증이 필요한 경우 관리자에게 문의하세요.");
                setLoading(false);
            }
        }
    };

    return (
        <Container size={420} my={60}>
            <Stack align="center" mb={30}>
                <Image
                    src="/brand/KJ_Logo.png"
                    alt="Kwangjeon Times Logo"
                    w={280}
                    fit="contain"
                />
                <Text c="dimmed" size="sm">
                    서비스 이용을 위한 관리자 계정 생성
                </Text>
            </Stack>

            <Paper withBorder shadow="md" p={30} radius="md">
                <Stack gap="md">
                    {error && <Alert color="red" title="오류">{error}</Alert>}

                    <TextInput
                        label="이름"
                        placeholder="홍길동"
                        required
                        value={name}
                        onChange={(event) => setName(event.currentTarget.value)}
                    />

                    <TextInput
                        label="아이디"
                        description="영문, 숫자 조합"
                        placeholder="userid123"
                        required
                        value={id}
                        onChange={(event) => setId(event.currentTarget.value)}
                    />

                    <PasswordInput
                        label="비밀번호"
                        placeholder="********"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />

                    <Button fullWidth onClick={handleSignup} loading={loading} color="dark">
                        가입하기
                    </Button>
                </Stack>
            </Paper>

            <Text ta="center" mt="xl" size="sm" c="dimmed">
                이미 계정이 있으신가요?
            </Text>
            <Button
                component={Link}
                href="/admin/login"
                variant="default"
                fullWidth
                mt="xs"
                style={{ textDecoration: 'none' }}
            >
                로그인 페이지로 돌아가기
            </Button>
        </Container>
    );
}
