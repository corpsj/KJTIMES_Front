"use client";

import { Container, Title, Text, Button, Paper, Stack, TextInput, List, ThemeIcon } from "@mantine/core";
import { IconCheck, IconMail } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";

export default function Subscribe() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.trim()) return;
        // TODO: 실제 구독 API 연동
        setSubmitted(true);
    }

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <Title order={1} ta="center">뉴스레터 구독</Title>
                <Text c="dimmed" ta="center" size="lg">
                    광전타임즈의 주요 뉴스를 이메일로 받아보세요.
                </Text>

                <Paper withBorder p="xl" radius="md">
                    {submitted ? (
                        <Stack gap="md" align="center" py="lg">
                            <ThemeIcon size={60} radius="xl" color="green">
                                <IconCheck size={32} />
                            </ThemeIcon>
                            <Title order={3}>구독 신청이 완료되었습니다</Title>
                            <Text c="dimmed" ta="center">
                                {email} 주소로 뉴스레터를 보내드리겠습니다.
                            </Text>
                            <Button
                                variant="light"
                                onClick={() => {
                                    setEmail("");
                                    setSubmitted(false);
                                }}
                            >
                                다른 이메일로 구독하기
                            </Button>
                        </Stack>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Stack gap="md">
                                <Title order={3}>이메일 뉴스레터</Title>
                                <Text size="sm" c="dimmed">
                                    매일 아침 광주·전남 지역의 주요 뉴스를 정리해서 보내드립니다.
                                </Text>
                                <TextInput
                                    type="email"
                                    placeholder="이메일 주소를 입력하세요"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    required
                                    size="md"
                                    leftSection={<IconMail size={18} />}
                                    aria-label="이메일 주소"
                                />
                                <Button type="submit" size="md" fullWidth>
                                    구독 신청하기
                                </Button>
                            </Stack>
                        </form>
                    )}
                </Paper>

                <Paper withBorder p="xl" radius="md" bg="gray.0">
                    <Title order={4} mb="md">구독 혜택</Title>
                    <List
                        spacing="sm"
                        icon={
                            <ThemeIcon size={20} radius="xl" color="blue">
                                <IconCheck size={12} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>매일 아침 주요 뉴스 요약 배달</List.Item>
                        <List.Item>광주·전남 지역 속보 알림</List.Item>
                        <List.Item>주간 특집 기사 큐레이션</List.Item>
                        <List.Item>언제든 구독 해지 가능</List.Item>
                    </List>
                </Paper>
            </Stack>
        </Container>
    );
}
