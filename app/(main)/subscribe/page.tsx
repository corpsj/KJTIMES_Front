import { Container, Title, Text, Button, Paper, Stack } from "@mantine/core";

export default function Subscribe() {
    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <Title order={1} ta="center">구독 신청</Title>
                <Text c="dimmed" ta="center">광전타임즈의 프리미엄 뉴스를 놓치지 마세요.</Text>

                <Paper withBorder p="xl" radius="md">
                    <Stack gap="md">
                        <Title order={3}>뉴스레터 구독</Title>
                        <Text>매일 아침 주요 뉴스를 이메일로 보내드립니다.</Text>
                        <Button>구독하기</Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
