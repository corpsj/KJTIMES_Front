"use client";

import { useState } from "react";
import { Paper, Stack, Title, TextInput, PasswordInput, Button, Text, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";

export function SignupForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "이름은 최소 2자 이상이어야 합니다" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "올바른 이메일을 입력해 주세요"),
      password: (value) => (value.length < 8 ? "비밀번호는 최소 8자 이상이어야 합니다" : null),
      confirmPassword: (value, values) =>
        value !== values.password ? "비밀번호가 일치하지 않습니다" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    console.log("Signup attempt:", values);
    setTimeout(() => {
      alert("회원가입 기능을 준비 중입니다");
      setLoading(false);
    }, 500);
  };

  return (
    <Paper withBorder shadow="md" p="xl" radius="md" maw={400} mx="auto">
      <Stack gap="md">
        <Title order={2} ta="center">회원가입</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="이름"
              placeholder="홍길동"
              required
              {...form.getInputProps("name")}
            />
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
            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              required
              {...form.getInputProps("confirmPassword")}
            />
            <Button type="submit" fullWidth loading={loading}>
              가입하기
            </Button>
          </Stack>
        </form>
        <Text size="sm" ta="center" c="dimmed">
          이미 계정이 있으신가요?{" "}
          <Anchor component={Link} href="/login" fw={600}>
            로그인
          </Anchor>
        </Text>
      </Stack>
    </Paper>
  );
}
