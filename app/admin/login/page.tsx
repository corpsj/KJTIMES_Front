"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Button, Paper, Title, Container, Stack, Alert, Text, Anchor, Image } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function AdminLogin() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async () => {
        if (!id || !password) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        // Transform ID to Email (Internal logic)
        const email = `${id}@kwangjeon.local`;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Customize error message for better UX
            if (error.message.includes("Invalid login credentials")) {
                setError("아이디 또는 비밀번호가 잘못되었습니다.");
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            router.push("/admin");
        }
    };

    return (
        <Container size={420} my={60}>
            <Stack align="center" mb={30}>
                {/* Logo */}
                <Image
                    src="/brand/KJ_Logo.png"
                    alt="Kwangjeon Times Logo"
                    w={280}
                    fit="contain"
                />
                <Text c="dimmed" size="sm">
                    광전타임즈 관리자 시스템
                </Text>
            </Stack>

            <Paper withBorder shadow="md" p={30} radius="md">
                <Stack gap="md">
                    {error && <Alert color="red" title="오류">{error}</Alert>}

                    <TextInput
                        label="아이디"
                        placeholder="admin"
                        required
                        value={id}
                        onChange={(event) => setId(event.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLogin();
                        }}
                    />
                    <PasswordInput
                        label="비밀번호"
                        placeholder="********"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLogin();
                        }}
                    />
                    <Button fullWidth onClick={handleLogin} loading={loading} color="dark">
                        로그인
                    </Button>
                </Stack>
            </Paper>

            <Text ta="center" mt="xl" size="sm" c="dimmed">
                계정이 없으신가요?
            </Text>
            <Button
                component={Link}
                href="/signup"
                variant="outline"
                color="gray"
                fullWidth
                mt="xs"
                style={{ textDecoration: 'none' }}
            >
                회원가입
            </Button>
        </Container>
    );
}
