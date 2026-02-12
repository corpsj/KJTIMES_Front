"use client";

import { useState } from "react";
import { Paper, Stack, Title, TextInput, PasswordInput, Button, Text, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "올바른 이메일을 입력해 주세요"),
      password: (value) => (value.length < 8 ? "비밀번호는 최소 8자 이상이어야 합니다" : null),
    },
  });

  const handleSubmit = async () => {
    setLoading(true);
    // Placeholder: 실제 인증 로직은 추후 구현
    setTimeout(() => {
      alert("로그인 기능을 준비 중입니다");
      setLoading(false);
    }, 500);
  };

  return (
    <Paper withBorder shadow="md" p="xl" radius="md" maw={400} mx="auto">
      <Stack gap="md">
        <Title order={2} ta="center">로그인</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="이메일"
              placeholder="your@email.com"
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              required
              {...form.getInputProps("password")}
            />
            <Button type="submit" fullWidth loading={loading}>
              로그인
            </Button>
          </Stack>
        </form>
        <Text size="sm" ta="center" c="dimmed">
          계정이 없으신가요?{" "}
          <Anchor component={Link} href="/signup" fw={600}>
            회원가입
          </Anchor>
        </Text>
      </Stack>
    </Paper>
  );
}
