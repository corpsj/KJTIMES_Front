"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Alert,
  Button,
  Card,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

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

    const email = `${id}@kwangjeon.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--mantine-color-gray-0) 0%, var(--mantine-color-gray-2) 100%)",
        padding: 20,
      }}
    >
      <Card
        shadow="xl"
        padding="xl"
        radius="lg"
        style={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        <Stack gap="lg">
          {/* Logo & Header */}
          <Stack gap="xs" align="flex-start">
            <Image
              src="/brand/KJ_sloganLogo.png"
              alt="광전타임즈"
              width={160}
              height={32}
              style={{ height: "auto" }}
              priority
            />
            <div>
              <Title order={3} fw={700} mt="xs">
                편집국 로그인
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                인증된 편집 권한으로만 접근할 수 있습니다.
              </Text>
            </div>
          </Stack>

          {/* Error */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              radius="md"
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
               <TextInput
                 label="아이디"
                 placeholder="아이디를 입력하세요"
                 value={id}
                 onChange={(event) => setId(event.currentTarget.value)}
                 autoComplete="username"
                 required
                 size="md"
               />
              <PasswordInput
                label="비밀번호"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                autoComplete="current-password"
                required
                size="md"
              />
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={loading}
                mt="xs"
              >
                {loading ? "인증 중..." : "로그인"}
              </Button>
            </Stack>
          </form>

          {/* Footer */}
          <Text size="xs" c="dimmed" ta="center">
            보안 접속: 모든 세션은 암호화되어 기록됩니다.
          </Text>
        </Stack>
      </Card>
    </div>
  );
}
