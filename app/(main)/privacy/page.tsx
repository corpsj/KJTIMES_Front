import { Container, Title, Text, Stack, Divider } from "@mantine/core";

export default function Privacy() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>개인정보처리방침</Title>
                <Text>
                    광전타임즈는 서비스 제공을 위해 최소한의 개인정보만을 수집하며,
                    수집된 정보는 고지된 목적 범위 내에서만 이용합니다.
                </Text>
                <Divider />
                <Stack gap="xs">
                    <Text fw={700}>수집 항목</Text>
                    <Text c="dimmed">이메일, 이름(선택), 서비스 이용 기록</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>이용 목적</Text>
                    <Text c="dimmed">구독 신청 처리, 문의 응대, 서비스 품질 개선</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>보관 기간</Text>
                    <Text c="dimmed">이용 목적 달성 시까지 또는 관련 법령에 따른 기간</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>문의</Text>
                    <Text c="dimmed">test@kjtimes.co.kr</Text>
                </Stack>
            </Stack>
        </Container>
    );
}
