import { Container, Title, Text, Stack, Divider } from "@mantine/core";

export default function Advertise() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>광고안내</Title>
                <Text>
                    광전타임즈는 지역 사회와 함께하는 건전한 광고를 환영합니다.
                    문의를 주시면 매체 소개서와 제안서를 안내드립니다.
                </Text>
                <Divider />
                <Stack gap="xs">
                    <Text fw={700}>광고 문의</Text>
                    <Text c="dimmed">전화: 010-1234-5678</Text>
                    <Text c="dimmed">이메일: test@kjtimes.co.kr</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>광고 정책</Text>
                    <Text c="dimmed">
                        모든 광고·협찬·유료 콘텐츠는 &quot;광고&quot; 또는 &quot;후원&quot; 표시를 통해
                        편집기사와 명확히 구분합니다.
                    </Text>
                </Stack>
            </Stack>
        </Container>
    );
}
